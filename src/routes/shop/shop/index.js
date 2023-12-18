const express = require('express')
const router = express.Router()
const {authenticationV2} = require("../../../auth/authUtils");
const shopController = require('../../../controllers/shop/shop.controller');


router.get('/status/:shopId', shopController.getStatusShop)
router.post('/status', shopController.openAndCloseShop)

router.use(authenticationV2)
router.get('/', shopController.listShop)

module.exports = router
