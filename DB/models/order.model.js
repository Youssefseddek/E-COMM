import mongoose from "mongoose";
import { OrderStatus, PaymentMethod } from "../../src/utils/index.js";
const { Schema, model } = mongoose

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    subTotal: {
        type: Number,
        required: true,
    },
    fromCart: {
        type: Boolean,
        default: true
    },
    address: String,
    addressId: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    contactNumber: {
        type: String,
        required: true
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',

    },
    shippingFee: {
        type: Number,
        required: true
    },
    VAT: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    estimatedDilveryDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: Object.values(PaymentMethod)
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    },
    deliveredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveredAt: Date,
    cancelledAt: Date,
    payment_intent: String
}, { timestamps: true })


// decrement the stock of product
orderSchema.post("save", async function (doc) {
    console.log(doc);
    console.log(doc.products);
    for (const product of doc.products) {
        console.log(product);
         await mongoose.models.Product.findByIdAndUpdate(product.productId, {
            $inc: {
                stock: -product.quantity
            }
        })
        console.log(product);
    }


    // increment usage count of coupon for this user
    if (doc.couponId) {
        console.log(doc.couponId);
        await mongoose.models.Coupon.updateOne(
            { _id: doc.couponId, 'users.userId': doc.userId },
            {
                $inc: { 'users.$.usageCount': 1 }
            }
        );
       
    }
})




export const Order =
    mongoose.models.Order || model('Order', orderSchema);