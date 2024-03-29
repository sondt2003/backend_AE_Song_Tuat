const catchAsync = require("../../helpers/catch.async");
const {OK} = require("../../core/success.response");
const {OrderService} = require("../../services/shop/order.service");

class OrderController {
    checkoutReview = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Get cart info success",
            await OrderService.checkoutReview({
                userId: req.user.userId,
                ...req.body,
            })
        );
    });

    order = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Get cart info success",
            await OrderService.orderByUser({userId: req.user.userId, ...req.body})
        );
    });
    orderV2 = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Get cart info success",
            await OrderService.orderByUserV2({userId: req.user.userId, ...req.body})
        );
    });
    getOrderByUser = catchAsync(async (req, res, next) => {

        OK(
            res,
            "Get order by user success",
            await OrderService.getOrderByUser({
                userId: req.user.userId,
                status: req.query.status,
                page: req.query.page,
                limit: req.query.limit
            })
        );
    });

    getOneOrderByUser = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Get one order by user success",
            await OrderService.getOneOrderByUser({
                userId: req.user.userId,
                orderId: req.params.orderId,
            })
        );
    });

    cancelOrderByUser = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Cancel order by user success",
            await OrderService.cancelOrderByUser({
                userId: req.user.userId,
                ...req.body,
            })
        );
    });

    topOrder = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Top Order By Shop success",
            await OrderService.topOrder(req.query)
        );
    });


    topOrderDetails = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Top Order By Shop success",
            await OrderService.topOrderDetails({shopId: req.user.userId, ...req.query})
        );
    });


    topProduct = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Top Product By Shop success",
            await OrderService.topProduct(req.query)
        );
    });

    topRevenue = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Top Revenue By Shop success",
            await OrderService.topRevenueShop(req.query)
        );
    });


    topRevenueShopDate = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Top Revenue By Shop success",
            await OrderService.topRevenueShopDate(req.query)
        );
    });

    updateOrderConfirmByShop = catchAsync(async (req, res, next) => {
        OK(
            res,
            "update Order Status By Shop success",
            await OrderService.updateOrderStatusByShop({
                shopId: req.user.userId,
                userId: req.params.userId,
                ...req.body,
            })
        );
    });
    updateOrderShippingByShop = catchAsync(async (req, res, next) => {
        OK(
            res,
            "update Order Status By Shop success",
            await OrderService.updateOrderStatusByShop({
                shopId: req.user.userId,
                userId: req.params.userId,
                ...req.body,
                status: "shipping",
                preStatus: "confirmed",
            })
        );
    });
    cancelOrderByShop = catchAsync(async (req, res, next) => {
        OK(res, "Update Order Status By shop success", await OrderService.cancelOrderByShop({
            orderId: req.params.orderId,
            reason: req.body.reason
        }))

    })
    listOrderStatusByShop = catchAsync(async (req, res, next) => {
        OK(
            res,
            "List Order Status By Shop success",
            await OrderService.listOrderStatusByShop({
                shopId: req.user.userId,
                ...req.body,
                ...req.query,
            })
        );
    });
    countOrderStatusByShop = catchAsync(async (req, res, next) => {
        OK(
            res,
            "Count Order Status By Shop success",
            await OrderService.CountOrderStatusByShop({
                shopId: req.user.userId,
                ...req.body,
                ...req.query,
            })
        );
    });

}

module.exports = new OrderController();
