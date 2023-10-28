const catchAsync = require('../helpers/catch.async')
const {OK} = require("../core/success.response");
const {OrderService} = require("../services/order.service");

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
}

module.exports = new OrderController()