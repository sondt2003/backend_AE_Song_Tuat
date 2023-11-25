const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");
const { TransactionHistoryService } = require('../../services/shop/transaction-history.service');

class TransactionHistoryController {
    createUserTransactionHistory = catchAsync(async(req, res, next) => {
        OK(res,  "create User Transaction History success", await TransactionHistoryService.createUserTransactionHistory({userId: req.user.userId,...req.body}))
    });

    updateUserTransactionHistory = catchAsync(async(req, res, next) => {
        OK(res,  "update User Transaction History success", await TransactionHistoryService.updateUserTransactionHistory({userId: req.user.userId,transactionHistoryId:req.params.transactionHistoryId,...req.body}))
    });
    deleteTransactionHistory = catchAsync(async(req, res, next) => {
        OK(res,  "delete Transaction History success", await TransactionHistoryService.deleteTransactionHistory({transactionHistoryId:req.params.transactionHistoryId,...req.body}))
    });

    getListUserTransactionHistory =  catchAsync(async(req, res, next) => {
        OK(res,  "get List User Transaction History", await TransactionHistoryService.getListUserTransactionHistory(req.user.userId))
    });

    getUserTransactionHistoryDetails =  catchAsync(async(req, res, next) => {
        OK(res,  "get User Transaction History Details", await TransactionHistoryService.getUserTransactionHistoryDetails({userId: req.user.userId,transactionHistoryId:req.params.transactionHistoryId,...req.body}))
    });
}

module.exports = new TransactionHistoryController()