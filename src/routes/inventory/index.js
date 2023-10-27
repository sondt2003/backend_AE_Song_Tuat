const express = require('express')
const router = express.Router()
const inventoryController = require('../../controllers/inventory.controller')
const { authenticationV2 } = require('../../auth/authUtils')

router.use(authenticationV2)
router.get('', inventoryController.addStockToInventory)

module.exports = router