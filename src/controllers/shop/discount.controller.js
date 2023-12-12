const catchAsync = require('../../helpers/catch.async')
const { OK } = require("../../core/success.response");
const { DiscountService } = require("../../services/shop/discount.service");

class DiscountController {
    createDiscountCode = catchAsync(async (req, res, next) => {
        OK(res, "Create discount success",
            await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
                permissions: req.permissions
            }));
    })//done

    updateDiscountCode = catchAsync(async (req, res) => {
        OK(res, "Update discount success",
            await DiscountService.updateDiscountCode({
                ...req.body,
                shopId: req.user.userId
            }));
    })//done

    getAllDiscountCodeWithProduct = catchAsync(async (req, res) => {
        OK(res, "Get Discount Code success",
            await DiscountService.getAllDiscountCodeWithProduct({
                ...req.query,
            }));
    })//done and not done postman

    getAllDiscountCodesByShop = catchAsync(async (req, res) => {
        OK(res, "Get all discount codes success",
            await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
            }));
    })

    getDiscountAmount = catchAsync(async (req, res) => {
        OK(res, "Get discount amount success",
            await DiscountService.getDiscountAmount({
                ...req.body,
                userId: req.user.userId
            }));
    })

    deleteDiscountCode = catchAsync(async (req, res) => {
        OK(res, "Delete discount success",
            await DiscountService.deleteDiscountCode({
                ...req.body,
                shopId: req.user.userId
            }));
    })

    cancelDiscountCode = catchAsync(async (req, res) => {
        OK(res, "Cancel discount success",
            await DiscountService.cancelDiscountCode({
                ...req.body,
                shopId: req.user.userId
            }));
    })

}

module.exports = new DiscountController()