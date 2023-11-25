const express = require('express')
const router = express.Router()
const {authenticationV2} = require("../../../auth/authUtils");
const shopController = require('../../../controllers/shop/shop.controller');

router.use(authenticationV2)
router.get('/', shopController.listShop)

module.exports = router
