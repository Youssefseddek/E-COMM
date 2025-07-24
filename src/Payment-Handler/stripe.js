import Stripe from 'stripe';
import { Coupon } from '../../DB/models/index.js';
import { couponType } from '../utils/index.js';


export const createCheckoutSession = async (
    {
        customer_email,
        metadata,
        discounts,
        line_items
    }
) => {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentData = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email,
        metadata,
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        discounts,
        line_items

    })
    return paymentData;

}

// create stripe coupon
export const createStripeCoupon = async (couponId) => {

    // find coupon by id
    const findCoupon = await Coupon.findById(couponId);
    if (!findCoupon) {
        return { status: false, message: "Coupon not found" }
    }

    let couponObject = {}
    if (findCoupon.couponType === couponType.FIXED) {
        couponObject = {
            name: findCoupon.couponCode,
            amount_off: findCoupon.couponAmount * 100, // convert to cents
            currency: 'EGP'
        }
    }
    if (findCoupon.couponType === couponType.PERCENTAGE) {
        couponObject = {
            name: findCoupon.couponCode,
            percent_off: findCoupon.couponAmount,
            currency: 'EGP'
        }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const stripeCoupon = await stripe.coupons.create(couponObject);
    return stripeCoupon;
}



// create a stripe payment method
export const createStripePaymentMethod = async (token) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            token: token
        }
    });
    return paymentMethod;
}

// create a stripe payment intent
export const createStripePaymentIntent = async (amount, currency = 'EGP') => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentMethod = await createStripePaymentMethod('tok_visa'); // Example token, replace with actual token from client
    if (!paymentMethod) {
        throw new Error('Failed to create payment method');
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // convert to cents
        currency,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never'
        },
        payment_method: paymentMethod.id,
    });
    return paymentIntent;
}


// retrieve a stripe payment intent
export const retrieveStripePaymentIntent = async (paymentIntentId) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
}

// confirm a stripe payment intent
export const confirmStripePaymentIntent = async (paymentIntentId) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentDetails = await retrieveStripePaymentIntent(paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentDetails.payment_method,
    });
    return paymentIntent;
}

// refund a stripe payment intent
export const refundStripePaymentIntent = async (paymentIntentId) => {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
    });
    return refund;
}
