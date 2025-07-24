import express from 'express'
import { config } from 'dotenv'
import db_connection from './DB/connection.js'
import { globaleResponse } from './src/middlewares/error-handling.middleware.js'
import * as router from './src/modules/index.js'
import { scheduleCronJob } from './src/utils/index.js'
import { gracefulShutdown } from 'node-schedule'



config() // Load environment variables from .env file
const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
// app.use(express.urlencoded({ extended: true }));
// Enable the extended query parser
app.set('query parser', 'extended');

app.use('/categories', router.categoryRouter)
app.use('/sub-categories', router.subCategoryRouter)
app.use('/products', router.productRouter)
app.use('/brands', router.brandRouter)
app.use('/users', router.userRouter)
app.use('/addresses', router.addressRouter)
app.use('/carts', router.cartRouter)
app.use('/coupons', router.couponRouter)
app.use('/orders', router.orderRouter)
app.use('/reviews', router.reviewRouter)


// app.get('*', (req, res,next) => res.send('In-valid Routing Please check url  or  method'))


app.use(globaleResponse)


db_connection() // Connect to the database

scheduleCronJob()
gracefulShutdown()

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


