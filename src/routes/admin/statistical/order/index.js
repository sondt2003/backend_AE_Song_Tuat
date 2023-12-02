const express = require("express");
const controller = require("../../../../controllers/admin/statistics/order")
const router = express.Router();

router.get('/count/:id', controller.CountOrder)
router.get('/count', controller.CountOrder)

module.exports = router

