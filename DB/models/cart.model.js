import mongoose from "mongoose";
import { calculateCartTotal } from "../../src/modules/cart/cart.utils.js";
const { Schema, model } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
    }

}, { timestamps: true })


cartSchema.pre("validate", function (next) {
    console.log(this);
    this.subTotal = calculateCartTotal(this.products)
    console.log(this.subTotal);
    
    console.log("calculate cart total before save");
    next()
})


cartSchema.post("save", async function (doc) {
    console.log( this );
    console.log({ doc });
    console.log({ Cart });
    if (doc.products.length == 0) {
        console.log("deleting cart as no products in cart");
        await Cart.deleteOne({ userId: doc.userId })
    }
})





export const Cart =
    mongoose.models.Cart || model('Cart', cartSchema);