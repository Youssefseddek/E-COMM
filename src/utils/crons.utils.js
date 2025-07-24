import { scheduleJob } from 'node-schedule'
import { Coupon } from '../../DB/models/index.js';
import { DateTime } from 'luxon';


export const scheduleCronJob = () => {
    scheduleJob('0 59 23 * * *', async () => {
        console.log('The answer to life, the universe, and everything!');
        const enabledCoupons = await Coupon.find({ isEnable: true })
        // console.log("enabledCoupons", enabledCoupons);
        if (enabledCoupons.length) {
            // 2025-07-29T00:00:00.000+00:00
            // console.log({
            //     tz: DateTime.fromJSDate(enabledCoupons[0].till)
            // });
            for (const coupon of enabledCoupons) {
                console.log(DateTime.fromJSDate(coupon.till));
                console.log(DateTime.now());
                console.log(DateTime.fromJSDate(coupon.till) < DateTime.now());
                if (DateTime.fromJSDate(coupon.till) < DateTime.now()) {
                    console.log("Coupon is expired");
                    coupon.isEnable = false
                    await coupon.save()
                }

            }


        }
    })
}