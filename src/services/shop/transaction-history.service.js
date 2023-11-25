const { Api404Error } = require("../../core/error.response");
const transaction_history = require("../../models/transaction-history.model");
const order = require("../../models/order.model");


class TransactionHistoryService {
    static async createUserTransactionHistory({ orderId,currency,payment_method,payment_date_time,billing_information,comments}) {
        const foundOrder =await order.findById(orderId)
        if (!foundOrder) throw new Api404Error('order not found')

        return (await transaction_history.create({ order_id:orderId,currency,payment_method,payment_date_time,billing_information,comments})).populate("order_id")
    }

    static async updateUserTransactionHistory({ transactionHistoryId,orderId,currency,payment_method,payment_date_time,billing_information,comments}) {
        const foundTransactionHistory =await transaction_history.findOne({_id:transactionHistoryId, order_id:orderId})
        
        if (!foundTransactionHistory) throw new Api404Error('TransactionHistory not found')
     
        const foundOrder =await order.findById(orderId)
        if (!foundOrder) throw new Api404Error('order not found')

        return await transaction_history.findOneAndUpdate({_id:transactionHistoryId,order_id:orderId},
            { order_id:orderId,currency,payment_method,payment_date_time,billing_information,comments},
            {new:true}).populate("order_id").lean();
    }

    static async deleteTransactionHistory({ transactionHistoryId,orderId}) {
        const deleteTransactionHistory =await transaction_history.findOneAndDelete({_id:transactionHistoryId,order_id:orderId})
            .populate("order_id").lean()
        if (!deleteTransactionHistory) throw new Api404Error('TransactionHistory not found')

        return deleteTransactionHistory;
    }
    static async getListUserTransactionHistory(userId) {
        return await transaction_history.find({
            user_id: userId
        }).populate("order_id").lean()
    }

    static async getUserTransactionHistoryDetails({ transactionHistoryId ,orderId}) {
        const foundTransactionHistory=await transaction_history.findOne({_id:transactionHistoryId,order_id:orderId}).populate("order_id").lean();
        if (!foundTransactionHistory) throw new Api404Error('TransactionHistory not found')
        return foundTransactionHistory;
    }
}

module.exports = {
    TransactionHistoryService,
}