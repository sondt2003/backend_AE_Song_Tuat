const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");
const {OrderService} = require("../../services/shop/order.service");

class OrderController {
    checkoutReview = catchAsync(async (req, res, next) => {
        OK(res,  "Get cart info success",
            await OrderService.checkoutReview({userId: req.user.userId,...req.body}));
    })

    order = catchAsync(async (req, res, next) => {
        OK(res,  "Get cart info success",
            await OrderService.orderByUser({userId: req.user.userId,...req.body}));
    })
    orderV2 = catchAsync(async (req, res, next) => {
        OK(res,  "Get cart info success",
            await OrderService.orderByUserV2({userId: req.user.userId,...req.body}));
    })
    getOrderByUser = catchAsync(async (req, res, next) => {
        OK(res,  "Get order by user success",
            await OrderService.getOrderByUser({userId: req.user.userId}));
    })

    getOneOrderByUser = catchAsync(async (req, res, next) => {
        OK(res,  "Get one order by user success",
            await OrderService.getOneOrderByUser({userId: req.user.userId,orderId:req.params.orderId}));
    })

    cancelOrderByUser = catchAsync(async (req, res, next) => {
        OK(res,  "Cancel order by user success",
            await OrderService.cancelOrderByUser({userId: req.user.userId,...req.body}));
    })


    updateOrderConfirmByShop = catchAsync(async (req, res, next) => {
        OK(res,  "update Order Status By Shop success",
            await OrderService.updateOrderStatusByShop({shopId: req.user.userId,userId: req.params.userId,...req.body}));
    })
    updateOrderShippingByShop = catchAsync(async (req, res, next) => {
        OK(
          res,
          "update Order Status By Shop success",
          await OrderService.updateOrderStatusByShop(
            { shopId: req.user.userId, userId: req.params.userId, ...req.body },
            "shipping",
            "confirmed"
          )
        );
    })

    listOrderStatusByShop = catchAsync(async (req, res, next) => {
        OK(res,  "list Order Status By Shop success",
            await OrderService.listOrderStatusByShop({shopId: req.user.userId,...req.body,...req.query}));
    })
}

module.exports = new OrderController()