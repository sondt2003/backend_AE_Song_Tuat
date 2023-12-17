const catchAsync = require('../../helpers/catch.async')
const NotifyUserService = require("../../services/shop/notyfyuser.service")
const {OK} = require("../../core/success.response");

class NotifyUserController {
    putNotify = catchAsync(async (req, res, next) => {
        OK(res, "Notify thành công", await NotifyUserService.putNotify({
            ...req.body
        }))
    })
    notifyByUserId = catchAsync(async (req, res, next) => {
        console.log(req.query)
        console.log(req.params)
        OK(res, "Get notify by user Id Success", await NotifyUserService.getUserNotifications({userId: req.params.userId, ...req.query}))
    })


}

module.exports = new NotifyUserController()
