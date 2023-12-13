const axios = require("axios")
const {native_notify_config} = require("../../configs/native_notify_config.js")
const shopservice = require("../../services/shop/shop.service")
const {Api404Error} = require("../../core/error.response");
const notifyModel = require("../../models/native_notify.model")

class NotifyUserService {

    static async createNotification({userId, title, message, typeNotify, orderId}) {
        // Your logic for creating a notification goes here
        const createNotify = await notifyModel.create({userId, title, message, typeNotify, orderId});
        return createNotify;
    }

    static async updateNotification({notificationId, userId, title, message, typeNotify, orderId}) {
        // Your logic for updating a notification goes here
        const foundNotification = await notifyModel.findOne({_id: notificationId, userId}).lean();
        if (!foundNotification) throw new Api404Error('Notification not found');

        // Update the notification fields
        const updatedNotify = await notifyModel.findOneAndUpdate(
            {_id: notificationId, userId},
            {title, message, typeNotify, orderId},
            {new: true}
        ).lean();

        return updatedNotify;
    }

    static async deleteNotification({notificationId, userId}) {
        // Your logic for deleting a notification goes here
        const foundNotification = await notifyModel.findOne({_id: notificationId, userId}).lean();
        if (!foundNotification) throw new Api404Error('Notification not found');

        // Delete the notification
        return await notifyModel.findOneAndDelete({_id: notificationId, userId}).lean();
    }

    static async getUserNotifications(userId) {
        // Your logic for getting user notifications goes here
        return await notifyModel.find({
            userId: userId
        }).lean();
    }

    static async getNotificationDetails({notificationId, userId}) {
        // Your logic for getting notification details goes here
        const foundNotification = await notifyModel.findOne({
            _id: notificationId,
            userId: userId
        }).lean();
        if (!foundNotification) throw new Api404Error('Notification not found');

        return foundNotification;
    }

    static async putNotify({user_id, title = "Thông báo", message = "Đây là thông báo test của hệ thống", type_notify
                           }) {
        let user = await shopservice.findByIdShop({_id: user_id})
        if (!user) {
            throw new Api404Error("Không tìm thấy shop")
        }
        axios.post(native_notify_config.url_indie, {
            subID: `${user_id}`,
            appId: native_notify_config.appId,
            appToken: native_notify_config.appToken,
            title: title,
            message: message,
        });
        await this.createNotification({userId: user_id, title, message, typeNotify: type_notify})
        return true
    }
}

module.exports = NotifyUserService