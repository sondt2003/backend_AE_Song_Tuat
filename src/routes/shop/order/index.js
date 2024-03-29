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
router.get('/count', orderController.countOrderStatusByShop)
router.post('/review', orderController.checkoutReview)

router.post('/v1', orderController.order)
router.post('/v2', orderController.orderV2)

router.get('/top-order-details', orderController.topOrderDetails);
router.get('/top-order', orderController.topOrder);

router.get('/top-product', orderController.topProduct);
router.get('/top-revenue', orderController.topRevenue);
router.get('/top-revenue-date', orderController.topRevenueShopDate);


router.get('/:orderId', orderController.getOneOrderByUser)


router.post('/cancel', orderController.cancelOrderByUser)

router.patch('/confirmed/:userId', orderController.updateOrderConfirmByShop)

router.patch('/shipping/:userId', orderController.updateOrderShippingByShop)
router.patch("/cancel/:orderId",orderController.cancelOrderByShop)
// router
module.exports = router