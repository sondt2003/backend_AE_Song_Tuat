const { OK } = require('../../../../core/success.response');
const catchAsync = require('../../../../helpers/catch.async');
const { DiscountService } = require('../../../../services/shop/discount.service');
class StatisticalDiscountController {
    CountDiscount =catchAsync(async (req, res) => {
        OK(res, "success", await DiscountService.countDiscount())
    })
}


module.exports = new StatisticalDiscountController();
