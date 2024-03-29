const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const shopController = require('../../controllers/shop/shop.controller')
const router = express.Router()

router.use(authenticationV2)
router.patch('/', shopController.updateUser)
router.patch('/v2', shopController.updateUserV2)

module.exports = router
