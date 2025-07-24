import { DateTime } from "luxon"
import { Coupon } from "../../../DB/models/index.js"


/** 
* @return {message :string ,error:Boolean,coupon:{}}
*/


export const validateCoupon = async (couponCode, userId) => {

    // get coupon by coupon code
    const coupon = await Coupon.findOne({ couponCode })
    console.log({coupon});
    
    if (!coupon) {
        return { message: 'Invalid coupon code', error: true }
    }

    // check if coupon enabled
    if (!coupon.isEnable || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
        return { message: 'Coupon is not enabled', error: true }
    }

    // check if coupon not started yet
    if ( DateTime.now() < DateTime.fromJSDate(coupon.from)) {
        return { message: `Coupon not started yet , will strat on ${coupon.from}`, error: true }
    }

    // check if user not eligible to use coupon
    // const isUserNotEligible  = coupon.users.some(u => u.userId.toString() !== userId.toString() || u.usageCount >= u.maxCount)
    // console.log({isUserNotEligible});
    
    // if (isUserNotEligible) {
    //     return { message: 'User not eligible to use this coupon or you reedem all your tries', error: true }
    // }
        // check if user is eligible to use coupon
    const userCouponUsage = coupon.users.find(u => u.userId.toString() === userId.toString());

    if (!userCouponUsage) {
        return { message: 'You are not eligible to use this coupon.', error: true };
    }
   

    if (userCouponUsage.usageCount >= userCouponUsage.maxCount) {
        return { message: 'You have already redeemed the maximum number of uses for this coupon.', error: true };
    }
   

    return { error: false, coupon }

}


import { DiscountType } from "../../utils/enums.utils.js";


export const calculateProductPrice = (subTotal, coupon) => {
    let total = subTotal;
    const {couponAmount:discountAmount,couponType:discountType} = coupon;
    console.log({discountAmount,discountType});
    
    if(discountType === DiscountType.PERCENTAGE){
        total = subTotal - (subTotal * discountAmount) / 100;
    }else if(discountType === DiscountType.FIXED){
        if (discountAmount > subTotal) {
            return total;       
        }
        total = subTotal - discountAmount;
    }
    return total;
}