

import { Router } from "express";
import * as controller from "./user.controller.js";
import { errorHandler } from "../../middlewares/index.js";

const userRouter = Router();

userRouter.post("/register",errorHandler(controller.resgisterUser))

userRouter.put("/update/:id",errorHandler(controller.updateAcount))

//Confirm Email
userRouter.get('/confirmEmail/:token', errorHandler(controller.confirmEmail))


// Sign In
userRouter.post('/signin', errorHandler(controller.signIn))




export {userRouter}