const express = require('express')
const router = express.Router()
const categoryController = require('../../controllers/category.controller')
const {authenticationV2} = require("../../auth/authUtils");

router.use(authenticationV2)

router.post('', categoryController.createCategory)
router.get('', categoryController. getAllCategory)
router.put('/:categoryId', categoryController.updateCategory)
router.delete('/:categoryId', categoryController.deleteCategory)

module.exports = router