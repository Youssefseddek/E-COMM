import Joi from "joi";
import { couponType } from "../../utils/index.js";

// A reusable Joi schema for validating MongoDB ObjectIds
const objectIdValidation = Joi.string().hex().length(24).messages({
    'string.hex': 'must be a valid hexadecimal string',
    'string.length': 'must be 24 characters long',
    'any.required': 'is a required field'
});

export const createCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().required(),
        from: Joi.date().greater('now').required(),
        till: Joi.date().greater(Joi.ref('from')).required(),
        users: Joi.array().items(
            Joi.object({
                userId: objectIdValidation.required(),
                maxCount: Joi.number().required(),
            })
        ).required(),
        couponType: Joi.string().valid(...Object.values(couponType)).required(),
        couponAmount: Joi.number().when('couponType', {
            is: couponType.PERCENTAGE,
            then: Joi.number().max(100).required(),
        }).min(1).required().messages({
            'number.max': 'Coupon amount must be less than 100',
            'number.min': 'Coupon amount must be greater than 0'
        })

    
    })
}


export const updateCouponSchema = {
    body: Joi.object({
        couponCode: Joi.string().optional(),
        from: Joi.date().greater('now').optional(),
        till: Joi.date().greater(Joi.ref('from')).optional(),
        users: Joi.array().items(
            Joi.object({
                userId: objectIdValidation.optional(),
                maxCount: Joi.number().optional(),
            })
        ).optional(),
        couponType: Joi.string().valid(...Object.values(couponType)).optional(),
        couponAmount: Joi.number().when('couponType', {
            is: couponType.PERCENTAGE,
            then: Joi.number().max(100).optional(),
        }).min(1).optional().messages({
            'number.max': 'Coupon amount must be less than 100',
            'number.min': 'Coupon amount must be greater than 0'
        })
    }),

    params: Joi.object({
        couponId: objectIdValidation.required()
    })

}