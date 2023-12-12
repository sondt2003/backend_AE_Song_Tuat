const express = require('express')
const router = express.Router()
const addressController = require('../../../controllers/shop/address.controller')
const {authenticationV2} = require("../../../auth/authUtils");



router.use(authenticationV2)
router.get('', addressController.getListUserAddress)
router.get('/:addressId', addressController.getUserAddressDetails)
router.post('', addressController.createUserAddress)
router.post('/:shopId', addressController.createShopAddress)
router.put('/:addressId', addressController.updateUserAddress)
router.delete('/:addressId', addressController.deleteAddress)

module.exports = router
