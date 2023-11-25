const accessService = require('../../services/shop/access.service')
const catchAsync = require('../../helpers/catch.async')
const {CREATED, OK} = require("../../core/success.response");
const { ShopService } = require('../../services/shop/shop.service');

class ShopController {
    updateUser = catchAsync(async (req, res) => {
        OK(res, "Register success", await ShopService.updateUser({userId: req.user.userId,...req.body}))
    })

    listShop = catchAsync(async (req, res) => {
        OK(res, "List Shop success", await ShopService.listShop(req.query))
    })
}

module.exports = new ShopController()