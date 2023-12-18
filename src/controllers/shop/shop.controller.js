const accessService = require('../../services/shop/access.service')
const catchAsync = require('../../helpers/catch.async')
const {CREATED, OK} = require("../../core/success.response");
const {ShopService} = require('../../services/shop/shop.service');

class ShopController {
    updateUser = catchAsync(async (req, res) => {
        OK(res, "Register success", await ShopService.updateUser({userId: req.user.userId, ...req.body, ...req.headers}))
    })
    updateUserV2 = catchAsync(async (req, res) => {
        OK(res, "Register success", await ShopService.updateUserV2({userId: req.user.userId, ...req.body, ...req.headers}))
    })
    listShop = catchAsync(async (req, res) => {
        OK(res, "List Shop success", await ShopService.listShop(req.query))
    })
    getStatusShop = catchAsync(async (req, res) => {
        OK(res, "get status code success", await ShopService.getStatusShop(req.params.shopId))
    })
    openAndCloseShop = catchAsync(async (req, res) => {
        OK(res, "Change Status code success", await ShopService.changeStatusShop({...req.body}))
    })
}

module.exports = new ShopController()