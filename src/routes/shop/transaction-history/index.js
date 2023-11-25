const express = require('express')
const router = express.Router()
const transactionHistoryController = require('../../../controllers/shop/transaction-history.controller')
const {authenticationV2} = require("../../../auth/authUtils");



router.use(authenticationV2)
router.get('', transactionHistoryController.getListUserTransactionHistory)
router.get('/:transactionHistoryId', transactionHistoryController.getUserTransactionHistoryDetails)
router.post('', transactionHistoryController.createUserTransactionHistory)
router.put('/:transactionHistoryId', transactionHistoryController.updateUserTransactionHistory)
router.delete('/:transactionHistoryId', transactionHistoryController.deleteTransactionHistory)

module.exports = router
