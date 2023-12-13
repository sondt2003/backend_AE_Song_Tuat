const catchAsync = require('../../helpers/catch.async')
const NotifyUserService = require("../../services/shop/notyfyuser.service")
const {OK} = require("../../core/success.response");

class NotifyUserController {
    putNotify = catchAsync(async (req, res, next) => {
        OK(res, "Notify thành công",await NotifyUserService.putNotify({
           ...req.body
        }))
    })


}

module.exports = new NotifyUserController()
