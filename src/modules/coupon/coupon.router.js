import { Router } from "express";
import * as controller from './coupon.controller..js'
import { auth, errorHandler, validation } from "../../middlewares/index.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.validation.js";

const couponRouter = Router()
// create coupon
couponRouter.post('/create',auth(),validation(createCouponSchema),errorHandler(controller.createCoupon))

// get all coupons
couponRouter.get('/',auth(),errorHandler(controller.getAllCoupons))

// get coupon by Id
couponRouter.get('/:couponId',auth(),errorHandler(controller.getCouponById))

// update coupon
couponRouter.put('/update/:couponId',auth(),validation(updateCouponSchema),errorHandler(controller.updateCoupon))

// enable/disable coupon
couponRouter.patch('/enable/:couponId',auth(),errorHandler(controller.toggleCouponStatus))



export { couponRouter }