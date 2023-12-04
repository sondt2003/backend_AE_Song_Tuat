const express = require('express')
const router = express.Router()
const categoryController = require('../../../controllers/shop/category.controller')
const {authenticationV2} = require("../../../auth/authUtils");



router.get('', categoryController.getAllCategory)
router.use(authenticationV2)

router.post('', categoryController.createCategory)

router.put('/:categoryId', categoryController.updateCategory)
router.delete('/:categoryId', categoryController.deleteCategory)


module.exports = router
