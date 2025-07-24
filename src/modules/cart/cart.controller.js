import { Cart, Product } from "../../../DB/models/index.js";
import { ErrorClass } from "../../utils/index.js";
import { checkProductStock } from "./cart.utils.js";



/**
 * @api {post} /carts/add add to cart
 */
export const AddToCart = async (req, res, next) => {

    const userId = req.user._id;
    const { quantity } = req.body;
    const { productId } = req.params;

    const product = await checkProductStock(productId, quantity)
    if (!product) {
        return next(new ErrorClass("Product not found", 404, "Product not found"))
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        // const subTotal = product.appliedPrice * quantity;
        const newCart = new Cart({
            userId,
            products: [{
                productId,
                quantity,
                price: product.appliedPrice
            }]
            
        })
        console.log({ newCart });
        
        await newCart.save()
        res.json({
            message: "Product added to cart",
            data: newCart
        })

    }

    const isProductExist = cart.products.find(p => p.productId == productId)
    console.log({ isProductExist });
    if (isProductExist) {
        return next(new ErrorClass("Product already exist in cart", 400, "Product already exist in cart"))

    }

    cart.products.push({
        productId,
        quantity,
        price: product.appliedPrice
    })
    // cart.subTotal += product.appliedPrice * quantity;
    await cart.save()
    res.json({
        message: "Product added to cart",
        data: cart
    })



}


/**
 * @api {put} /carts/remove remove from cart
 */
export const RemoveFromCart = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(new ErrorClass("Product not found in cart", 404, "Product not found in cart"))
    }
    cart.products = cart.products.filter(p => p.productId != productId)
    // if (cart.products.length == 0) {
    //     await cart.deleteOne({ userId })
    //     return res.json({
    //         message: "Product removed from cart",
    //         data: cart
    //     })
    // }


    // cart.subTotal = 0
    // cart.products.forEach(p => {
    //     cart.subTotal += p.price * p.quantity

    // })

    await cart.save()
    res.json({
        message: "Product removed from cart",
        data: cart
    })

}



/**
 * @api {put} /carts/update update cart
 */
export const UpdateCart = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId, "products.productId": productId });
    if (!cart) {
        return next(new ErrorClass("Product not found in cart", 404, "Product not found in cart"))
    }

    const product = await checkProductStock(productId, quantity)
    if (!product) {
        return next(new ErrorClass("Product not available", 404, "Product not available"))
    }

    // const pp = cart.products.find(p => p.productId == productId)
    // pp.quantity = quantity
    // pp.price = product.appliedPrice

    const productIndex = cart.products.findIndex(p => p.productId == productId)
    console.log({ productIndex });
    cart.products[productIndex].quantity = quantity
    cart.products[productIndex].price = product.appliedPrice



    // cart.subTotal = 0
    // cart.products.forEach(p => {
    //     cart.subTotal += p.price * p.quantity
    // })
    await cart.save()

    res.status(200).json({
        message: "Cart updated",
        data: cart
    })
    

}

/**
 * @api {get} /carts/ get cart
 */
export const GetCart = async (req, res, next) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
    res.status(200).json({
        message: "Cart fetched",
        data: cart
    })
}

