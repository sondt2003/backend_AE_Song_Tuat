const express = require('express')
const router = express.Router()
const orderController = require('../../../controllers/shop/order.controller')
const {authenticationV2} = require("../../../auth/authUtils");



/**
 * 1. Create New Order [User]
 * 2. Query Orders [User]
 * 3. Query Order Using It's ID [User]
 * 4. Cancel Order [User]
 * 5. Update Order Status [Admin]
 */
router.use(authenticationV2)

router.get('/', orderController.getOrderByUser)
router.get('/shop', orderController.listOrderStatusByShop)

router.post('/review', orderController.checkoutReview)

router.post('/v1', orderController.order)
router.post('/v2', orderController.orderV2)

router.get('/:orderId', orderController.getOneOrderByUser)

router.post('/cancel', orderController.cancelOrderByUser)

router.patch('/confirmed/:userId', orderController.updateOrderStatusByShop)


// router
module.exports = router