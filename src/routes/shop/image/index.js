const express = require('express')
const router = express.Router()
const imageController = require('../../../controllers/image.controller');

router.get('/:name', imageController.getUrl)

module.exports = router
