import { DateTime } from "luxon";
import { Address, Cart, Order, Product } from "../../../DB/models/index.js";
import { ApiFeatures, ErrorClass, OrderStatus, PaymentMethod } from "../../utils/index.js";
import { calculateCartTotal } from "../cart/cart.utils.js";
import { calculateProductPrice, validateCoupon } from "./order.utils.js";
import { confirmStripePaymentIntent, createCheckoutSession, createStripeCoupon, createStripePaymentIntent, refundStripePaymentIntent } from "../../Payment-Handler/stripe.js";

/**
 * @api {POST} /orders/create create order
 */
export const createOrder = async (req, res, next) => {
  const userId = req.user._id;
  const {
    address,
    addressId,
    contactNumber,
    couponCode,
    shippingFee,
    VAT,
    paymentMethod,
  } = req.body;

  // find logged in user cart with products
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart || cart.products.length === 0) {
    return next(new ErrorClass("Cart is empty", 400, "Cart is empty"));
  }
  console.log(cart);

  // check if any product is sold out
  const isSoldOut = await cart.products.find(
    (p) => p.productId.stock < p.quantity
  );
  console.log({ isSoldOut });
  if (isSoldOut) {
    return next(
      new ErrorClass(
        `Product ${isSoldOut.productId.title} is sold out`,
        400,
        `Product is sold out`
      )
    );
  }

  let subTotal = calculateCartTotal(cart.products);
  // total
  subTotal = subTotal + shippingFee + VAT;
  let total = subTotal;

  // coupon
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);
    console.log({ isCouponValid });
    if (isCouponValid.error) {
      return next(
        new ErrorClass(isCouponValid.message, 400, isCouponValid.message)
      );
    }
    console.log({ subTotal });
    console.log({ total });

    total = calculateProductPrice(subTotal, isCouponValid.coupon);
    console.log({ total });

    coupon = isCouponValid.coupon;
  }

  if (!address && !addressId) {
    return next(
      new ErrorClass("Address is required", 400, "Address is required")
    );
  }

  if (addressId) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return next(new ErrorClass("Invalid address", 400, "Invalid address"));
    }
  }

  let orderStatus = OrderStatus.Pending;
  if (PaymentMethod === PaymentMethod.Cash) {
    orderStatus = OrderStatus.Placed;
  }

  const order = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber,
    couponId: coupon?._id,
    shippingFee,
    VAT,
    subTotal,
    total,
    paymentMethod,
    orderStatus,
    estimatedDilveryDate: DateTime.now()
      .plus({ day: 7 })
      .toFormat("yyyy-MM-dd"),
  });

  await order.save();

  //clear the cart
  cart.products = [];
  cart.subTotal = 0;
  await cart.save();

  res.status(201).json({ message: "Order created successfully", data: order });
};

/**
 * @api {PUT} /orders/cancel/orderId cancel order
 */
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  // get order by orderId userid
  // check if order status is pending or confirmed or palced
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Pending, OrderStatus.Placed, OrderStatus.Confirmed],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }

  // check if order created befor three days
  const orderDate = DateTime.fromJSDate(order.createdAt);
  const currentDate = DateTime.now();
  const difference = Math.ceil(
    Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
  );
  console.log({ difference });
  console.log(Math.ceil(currentDate.diff(orderDate, "days").toObject().days));
  if (difference > 3) {
    return next(
      new ErrorClass(
        "Order cannot be cancelled after three days",
        400,
        "Order cannot be cancelled after three days"
      )
    );
  }

  console.log(DateTime.now().toJSDate());
  console.log(DateTime.now());

  // update order status to cancel
  order.orderStatus = OrderStatus.Cancelled;
  order.cancelledBy = userId;
  order.cancelledAt = DateTime.now().toJSDate();
  await Order.updateOne({ _id: orderId }, order);
  // update product model
  for (const product of order.products) {
    // console.log(product);
    await Product.findByIdAndUpdate(product.productId, {
      $inc: {
        stock: product.quantity,
      },
    });
    // console.log(product);
  }

  // return coupon

  res
    .status(200)
    .json({ message: "Order cancelled successfully", data: order });
};

/**
 * @api {PUT} /orders/deliverd/orderId deliverd order
 */
export const deliverdOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Placed, OrderStatus.Confirmed],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }

  order.orderStatus = OrderStatus.Delivered;
  order.deliveredBy = userId;
  order.deliveredAt = DateTime.now().toJSDate();
  await Order.updateOne({ _id: orderId }, order);

  res
    .status(200)
    .json({ message: "Order delivered successfully", data: order });
};

/**
 * @api {GET} /orders list of orders (by userId)
 */
export const listOrders = async (req, res, next) => {
  const userId = req.user._id;
  const query = { userId, ...req.query }
  // console.log(...req.query);

  const populateArry = [
    { path: 'product.productId', select: 'title appliedPrice stock' }
  ]

  const ApiFeaturesInstance = new ApiFeatures(Order.find(), query)
  ApiFeaturesInstance.filter()

  console.log(ApiFeaturesInstance.filter());

  const orders = await ApiFeaturesInstance.mongooseQuery;
  console.log({ orders });

  res.status(200).json({ message: "Orders fetched successfully", data: orders });

}

/**
 * @api {POST} /stripePay/orderId 
 */
export const stripePay = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: userId } = req.user;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: OrderStatus.Pending,
  }).populate('products.productId');
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }
  // create stripe checkout session
  const session = {
    customer_email: req.user.email,
    metadata: {
      orderId: order._id.toString(),
    },
    discounts: [],
    line_items: [
      ...order.products.map((product) => {
        return {
          price_data: {
            currency: 'EGP',
            product_data: {
              name: product.productId.title,
            },
            unit_amount: product.price * 100, // in cents
          },
          quantity: product.quantity
        }
      }),

      // Shipping Fee as separate line item
      // {
      //   price_data: {
      //     currency: 'EGP',
      //     product_data: {
      //       name: 'Shipping Fee',
      //     },
      //     unit_amount: order.shippingFee * 100, // convert to cents
      //   },
      //   quantity: 1
      // },

      // VAT as separate line item
      // {
      //   price_data: {
      //     currency: 'EGP',
      //     product_data: {
      //       name: 'VAT',
      //     },
      //     unit_amount: order.VAT * 100, // convert to cents
      //   },
      //   quantity: 1
      // }

    ]

  }

  if (order.couponId) {
    console.log(order.couponId);

    const coupon = await createStripeCoupon(order.couponId);
    if (coupon.status) {
      return next(new ErrorClass(coupon.message, 400, coupon.message));
    }
    console.log({ coupon });

    session.discounts.push({
      coupon: coupon.id
    });
    console.log({ ss: session.discounts });

  }

  const checkoutSession = await createCheckoutSession(session);
  const paymentIntent = await createStripePaymentIntent(order.total, 'EGP');

  const updatedOrder = await Order.findByIdAndUpdate(orderId, {
    payment_intent: paymentIntent.id,
  }, { new: true });

  // send the session url to the client
  res.status(200).json({ message: "Payment session created successfully", url: checkoutSession.url ,paymentIntent, data: checkoutSession });

}


/**
 * @api {POST} /webhook stripe webhook
 */
export const webhook = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;
  console.log({ orderId });
  const confirmedOrder = await Order.findByIdAndUpdate(orderId, {
    orderStatus: OrderStatus.Confirmed,
  });

  const confirmPaymentIntent = await confirmStripePaymentIntent(confirmedOrder.payment_intent);
  console.log(confirmPaymentIntent);
  
  console.log("======================== webhook =======================",req.body.data.object.metadata);
  res.status(200).json({ message: "Webhook received successfully" });

}


// refund order
export const refundOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  // get order by orderId userid
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: OrderStatus.Confirmed,
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }

  // check if payment intent exists
  if (!order.payment_intent) {
    return next(new ErrorClass("Payment intent not found", 400, "Payment intent not found"));
  }

  // refund the payment intent
  const refund = await refundStripePaymentIntent(order.payment_intent);
  console.log({ refund });
  
  
  // update order status to refunded
  order.orderStatus = OrderStatus.Refunded;
  await Order.updateOne({ _id: orderId }, order);

  res.status(200).json({ message: "Order refunded successfully", data: refund });
}


