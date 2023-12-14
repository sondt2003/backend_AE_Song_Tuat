const axios = require("axios")
const {native_notify_config} = require("../../configs/native_notify_config.js")
const shopservice = require("../../services/shop/shop.service")
const {Api404Error} = require("../../core/error.response");
const notifyModel = require("../../models/native_notify.model")

const NotifyTemplate =
    Object.freeze({
            pending: {
                message: "Hãy chờ shop xác nhận đơn hàng của bạn",
                title: "Đơn hàng của bạn đã được đặt"
            }, confirmed: {
                message: "Hãy chờ shop chuẩn bị đơn hàng của bạn",
                title: "Đơn hàng của bạn đã được xác nhận"
            }, shipping: {
                message: "Đơn hàng sẽ sớm đến thôi, hãy kiên nhẫn nhé!!!",
                title: "Đơn hàng của bạn đang được giao đi"
            }, delivered: {
                message: "Chúc ngon miệng ,hãy nhớ để lại đánh giá để những người khác biết về trải nghiệm của bạn nhé",
                title: "Đơn hàng đã được giao đến"
            }, canceled: {
                message: "Đơn hàng đã bị huỷ,Thật tiếc",
                title: "Đơn hàng bị huỷ"
            },
        }
    )


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

    static async getUserNotifications({userId, limit, page, sort}) {
        const skip = (page - 1) * limit;
        const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1};

        const notifications = await notifyModel
            .find({userId: userId})
            .limit(limit)
            .skip(skip)
            .sort(sortBy)
            .lean();

        // Tính thời gian kể từ thời điểm tạo và thêm vào mỗi thông báo
        const currentTime = new Date();
        const notificationsWithTimeDifference = notifications.map((notification) => {
            const createdAt = new Date(notification.createdAt);
            const timeDifference = currentTime - createdAt;

            // Chuyển đổi timeDifference thành giây, phút và giờ
            const seconds = Math.floor(timeDifference / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            return {
                ...notification,
                timeDifference: {
                    milliseconds: timeDifference,
                    seconds: seconds,
                    minutes: minutes,
                    hours: hours,
                },
            };
        });

        return notificationsWithTimeDifference;
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

    static async putNotify({
                               user_id,
                               title = "Thông báo",
                               message = "Đây là thông báo test của hệ thống",
                               type_notify
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

    static async notifyOrder({user_id, type_notify, order_id}) {
        let user = await shopservice.findByIdShop({_id: user_id})
        if (!user) {
            throw new Api404Error("Không tìm thấy shop")
        }
        const contentNotify = NotifyTemplate[type_notify]
        if (!contentNotify) {
            throw new Api404Error("Không tìm thấy nội dung notify phù hợp")
        }
        axios.post(native_notify_config.url_indie, {
            subID: `${user_id}`,
            appId: native_notify_config.appId,
            appToken: native_notify_config.appToken,
            title: contentNotify.title,
            message: contentNotify.message,
        });
        await this.createNotification({
            userId: user_id,
            title: contentNotify.title,
            message: contentNotify.message,
            typeNotify: type_notify,
            orderId: order_id
        })
        return true
    }
}

module.exports = NotifyUserService