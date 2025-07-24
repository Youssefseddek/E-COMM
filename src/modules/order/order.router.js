import { Router } from 'express'
import * as controller from './order.controller.js'
import { auth, errorHandler } from '../../middlewares/index.js'

const orderRouter = Router()


// create order
orderRouter.post('/create', auth(), errorHandler(controller.createOrder))

// cancel order
orderRouter.put('/cancel/:orderId', auth(), errorHandler(controller.cancelOrder))

// deliverd order
orderRouter.put('/deliverd/:orderId', auth(), errorHandler(controller.deliverdOrder))

// list orders
orderRouter.get('/list', auth(), errorHandler(controller.listOrders))

// stripePay
orderRouter.post('/stripePay/:orderId', auth(), errorHandler(controller.stripePay))


// webhook
orderRouter.post('/webhook', errorHandler(controller.webhook))

// refund order
orderRouter.put('/refund/:orderId', auth(), errorHandler(controller.refundOrder))


export default orderRouter;




export { orderRouter }