const { Api404Error } = require("../../core/error.response");
const {create, find, findOne, findOneAndDelete, findOneAndUpdate} = require("../../models/transaction-history.model");
const order = require("../../models/order.model");


class TransactionHistoryService {
    static async createUserTransactionHistory({ userId,orderId,currency,payment_method,payment_date_time,billing_information,comments}) {
        const foundOrder =await order.findById(orderId)
        if (!foundOrder) throw new Api404Error('order not found')

        return (await create({user_id:userId, order_id:orderId,currency,payment_method,payment_date_time,billing_information,comments})).populate("order_id")
    }

    static async updateUserTransactionHistory({userId, transactionHistoryId,orderId,currency,payment_method,payment_date_time,billing_information,comments}) {
        const foundTransactionHistory =await findOne({_id:transactionHistoryId, order_id:orderId,user_id:userId})
        
        if (!foundTransactionHistory) throw new Api404Error('TransactionHistory not found')
     
        const foundOrder =await order.findById(orderId)
        if (!foundOrder) throw new Api404Error('order not found')

        return findOneAndUpdate({_id: transactionHistoryId, order_id: orderId, user_id: userId},
            {order_id: orderId, currency, payment_method, payment_date_time, billing_information, comments},
            {new: true}).populate("order_id").lean();
    }

    static async deleteTransactionHistory({ transactionHistoryId,orderId,userId}) {
        const deleteTransactionHistory =await findOneAndDelete({_id:transactionHistoryId,order_id:orderId,user_id:userId})
            .populate("order_id").lean()
        if (!deleteTransactionHistory) throw new Api404Error('TransactionHistory not found')

        return deleteTransactionHistory;
    }
    static async getListUserTransactionHistory(userId) {
        return find({
            user_id: userId
        }).populate("order_id").lean();
    }

    static async getUserTransactionHistoryDetails({ transactionHistoryId ,orderId,userId}) {
        const foundTransactionHistory=await findOne({_id:transactionHistoryId,order_id:orderId,user_id:userId}).populate("order_id").lean();
        if (!foundTransactionHistory) throw new Api404Error('TransactionHistory not found')
        return foundTransactionHistory;
    }
}

module.exports = {
    TransactionHistoryService,
}