import { Router } from "express";
import * as controller from "./addresses.controller.js";
import { auth, errorHandler } from "../../middlewares/index.js";



const addressRouter = Router();


// add address
addressRouter.post("/add", auth(),errorHandler(controller.addAddress))

// update address
addressRouter.put("/edit/:id", auth(),errorHandler(controller.updateAddress))

// soft delete address
addressRouter.put("/soft-delete/:id", auth(),errorHandler(controller.softDeleteAddress))

// get addresses
addressRouter.get("/", auth(),errorHandler(controller.getAddresses))



export {addressRouter}