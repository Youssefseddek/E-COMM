import { Coupon, couponChangeLog, User } from "../../../DB/models/index.js"
import { ErrorClass } from "../../utils/index.js";

/**
 * @api {POST} /coupons/create create coupon
 */
export const createCoupon = async (req, res, next) => {

    const { couponCode, couponAmount, couponType, from, till, users } = req.body
    console.log(couponCode);

    const conuponExist = await Coupon.findOne({ couponCode: couponCode })
    if (conuponExist) {
        return next(new ErrorClass("Coupon already exist", 400, "Coupon already exist"))
    }

    const userIds = users.map(u => u.userId)
    const usersValidate = await User.find({ _id: { $in: userIds } })
    if (usersValidate.length != userIds.length) {
        return next(new ErrorClass("User not found", 404, "User not found"))
    }
    const newCoupon = new Coupon({
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
        users,
        createdBy: req.user._id
    })
    await newCoupon.save()
    res.status(201).json({
        message: "Coupon created",
        data: newCoupon
    })

}


/**
 * @api {GET} /coupons/ get all coupons
 */
export const getAllCoupons = async (req, res, next) => {

    const { isEnable } = req.query

    const fillter = {}
    if (isEnable) {
        fillter.isEnable = isEnable === "true" ? true : false
    }

    const coupons = await Coupon.find(fillter)
    res.status(200).json({
        message: "Coupons found",
        data: coupons
    })

}

/**
 * @api {GET} /coupons/couponId get coupon by Id
 */
export const getCouponById = async (req, res, next) => {
    const { couponId } = req.params
    const coupon = await Coupon.findOne({ _id: couponId })
    if (!coupon) {
        return next(new ErrorClass("Coupon not found", 404, "Coupon not found"))
    }
    res.status(200).json({
        message: "Coupon found",
        data: coupon
    })
}


/**
 * @api {PUT} /coupons/update/:couponId update coupons
 */
export const updateCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const userId  = req.user._id
    
    const { couponCode, couponAmount, couponType, from, till, users } = req.body

    const coupon = await Coupon.findById(couponId)
    if (!coupon) {
        return next(new ErrorClass("Coupon not found", 404, "Coupon not found"))
    }
    const logUpdateObject = { couponId, updatedBy: userId, changes: {} }
    console.log(logUpdateObject);


    if (couponCode) {
        const isCouponCodeExist = await Coupon.findOne({ couponCode: couponCode })
        if (isCouponCodeExist) {
            return next(new ErrorClass("Coupon code already exist", 400, "Coupon code already exist"))
        }
        coupon.couponCode = couponCode
        logUpdateObject.changes.couponCode = couponCode
    }

    if (couponAmount) {
        coupon.couponAmount = couponAmount
        logUpdateObject.changes.couponAmount = couponAmount
    }

    if (couponType) {
        coupon.couponType = couponType
        logUpdateObject.changes.couponType = couponType
    }

    if (from) {
        coupon.from = from
        logUpdateObject.changes.from = from
    }

    if (till) {
        coupon.till = till
        logUpdateObject.changes.till = till
    }

    if (users) {
        const userIds = users.map(u => u.userId)
        const usersValidate = await User.find({ _id: { $in: userIds } })
        if (usersValidate.length != userIds.length) {
            return next(new ErrorClass("User not found", 404, "User not found"))
        }

        coupon.users = users
        logUpdateObject.changes.users = users
    }

    await coupon.save()
    await couponChangeLog.create(logUpdateObject)
    res.status(200).json({
        message: "Coupon updated",
        data: coupon,
        logUpdateObject

    })

}

/**
 * @api {PATCH} /coupons/:couponId Enable or Disable coupons
 */
export const toggleCouponStatus = async (req, res, next) => {
      const { couponId } = req.params
    const userId  = req.user._id
    const { enable} = req.body

    const coupon = await Coupon.findById(couponId)
    if (!coupon) {
        return next(new ErrorClass("Coupon not found", 404, "Coupon not found"))
    }
    const logUpdateObject = { couponId, updatedBy: userId, changes: {} }
    console.log(logUpdateObject);

    if(enable === true || enable === false) {
        coupon.isEnable = enable
        logUpdateObject.changes.isEnable = enable
    }

    await coupon.save()
    await couponChangeLog.create(logUpdateObject)

    res.status(200).json({
        message: `Coupon ${enable ? 'enabled' : 'disabled'}`,
        data: coupon,
        logUpdateObject
    })
}