const express = require('express')
const router = express.Router()
const accessController = require('../../controllers/access.controller')
const {authenticationV2} = require("../../auth/authUtils");
const validation = require('../../middleware/validators/access.validator')

router.use(authenticationV2)
router.patch('/', accessController.updateUser)

module.exports = router
