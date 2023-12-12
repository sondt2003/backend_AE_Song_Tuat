const axios = require("axios")
const {native_notify_config} = require("../../configs/native_notify_config.js")

class NotifyUserService {
    static putNotify({userId, title = "Thông báo", message = "Đây là thông báo test của hệ thống"}) {
        axios.post(native_notify_config.url_indie, {
            subID: `${userId}`,
            appId: native_notify_config.appId,
            appToken: native_notify_config.appToken,
            title: title,
            message: message,
        });
        return true
    }
}

module.exports = NotifyUserService