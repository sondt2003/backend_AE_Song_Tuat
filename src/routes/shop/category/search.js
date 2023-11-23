const express = require('express')
const router = express.Router()
const categoryController = require('../../../controllers/shop/category.controller')
const {authenticationV2} = require("../../../auth/authUtils");



router.get('', categoryController. getAllCategory)


module.exports = router
