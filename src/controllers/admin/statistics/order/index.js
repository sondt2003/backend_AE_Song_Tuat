const orderModel = require("../../../../models/order.model")
const {
    Api403Error,
    Api404Error,
    Api401Error,
} = require("../../../../core/error.response");
const catchAsync = require("../../../../helpers/catch.async")
const {OK} = require("../../../../core/success.response");
const OrderStatisticalService = require("../../../../services/admin/order.statistical.service")

class StatisticalOrderController {
    CountOrder = async (req, res) => {
        catchAsync(OK(res, "successfully", await OrderStatisticalService.CountOrder()))

    }

}

module.exports = new StatisticalOrderController();