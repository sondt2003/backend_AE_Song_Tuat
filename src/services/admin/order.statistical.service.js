const orderModel = require("../../models/order.model");
class OrderStatisticalService {
    static async CountOrder() {
        let totalOrder = await orderModel.countDocuments({});
        let totalOrderPending = await orderModel.countDocuments({
            order_status: 'pending'
        })
        let totalOrderConfirmed = await orderModel.countDocuments({
            order_status: 'confirmed'
        })
        let totalOrderShipping = await orderModel.countDocuments({
            order_status: 'shipping'
        })
        let totalOrderCanceled = await orderModel.countDocuments({
            order_status: 'canceled'
        })
        let totalOderDelivered = await orderModel.countDocuments({
            order_status: 'delivered'
        })
        return {
            totalOrder,
            totalOrderPending,
            totalOrderConfirmed,
            totalOrderShipping,
            totalOrderCanceled,
            totalOderDelivered
        }
    }


}
module.exports = OrderStatisticalService