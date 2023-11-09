const express = require('express')
const router = express.Router()
const {authenticationV2} = require("../../auth/authUtils");
const validation = require('../../middleware/validators/access.validator');
const shopController = require('../../controllers/shop.controller');

router.use(authenticationV2)
router.patch('/', shopController.updateUser)

module.exports = router
