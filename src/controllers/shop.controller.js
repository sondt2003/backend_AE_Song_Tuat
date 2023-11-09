const accessService = require('../services/access.service')
const catchAsync = require('../helpers/catch.async')
const {CREATED, OK} = require("../core/success.response");
const { ShopService } = require('../services/shop.service');

class ShopController {
    updateUser = catchAsync(async (req, res) => {
        OK(res, "Register success", await ShopService.updateUser({userId: req.user.userId,...req.body}))
    })
}

module.exports = new ShopController()