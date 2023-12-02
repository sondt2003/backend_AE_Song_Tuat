const orderModel = require("../../models/order.model");
const {Api404Error} = require("../../core/error.response");


class OrderStatisticalService {
    static async CountOrder({shopid}) {
        console.log('------------------------------------------------------------', shopid)
        if (shopid) {
            let totalOrder = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }
            }).countDocuments({});
            let totalOrderPending = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }

            }).countDocuments({order_status: 'pending'})

            let totalOrderConfirmed = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }
            }).countDocuments({order_status: 'confirmed'})
            let totalOrderShipping = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }
                ,
            }).countDocuments({order_status: 'shipping'})
            let totalOrderCanceled = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }
                ,
            }).countDocuments({order_status: 'canceled'})
            let totalOderDelivered = await orderModel.find({
                "order_products": {
                    $elemMatch: {
                        "shopId": shopid
                    }
                }
                ,
            }).countDocuments({order_status: 'delivered'})
            return {
                totalOrder,
                totalOrderPending,
                totalOrderConfirmed,
                totalOrderShipping,
                totalOrderCanceled,
                totalOderDelivered
            }
        }
        let totalOrder = await orderModel.countDocuments({});
        let totalOrderPending = await orderModel.countDocuments({order_status: 'pending'})

        let totalOrderConfirmed = await orderModel.countDocuments({order_status: 'confirmed'})
        let totalOrderShipping = await orderModel.countDocuments({order_status: 'shipping'})
        let totalOrderCanceled = await orderModel.countDocuments({order_status: 'canceled'})
        let totalOderDelivered = await orderModel.countDocuments({order_status: 'delivered'})
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

module
    .exports = OrderStatisticalService