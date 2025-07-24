import { Router } from "express";
import * as controller from "./cart.controller.js";
import { auth, errorHandler } from "../../middlewares/index.js";




const cartRouter = Router();


// add To cart
cartRouter.post("/add/:productId", auth(), errorHandler(controller.AddToCart))

// remove from cart
cartRouter.put("/remove/:productId", auth(), errorHandler(controller.RemoveFromCart))

// update cart
cartRouter.put("/update/:productId", auth(), errorHandler(controller.UpdateCart))

// get cart
cartRouter.get("/", auth(), errorHandler(controller.GetCart))






export default cartRouter






export { cartRouter }