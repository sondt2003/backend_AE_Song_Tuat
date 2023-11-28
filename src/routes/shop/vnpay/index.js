const express = require("express");
const vnpayController = require("../../../controllers/shop/vnpay.controller");
const route = express.Router();

route.post("/create_payment_url",vnpayController.createPaymentUrl)
route.get("/vnpay_return",vnpayController.vnPayReturn)

module.exports = route;
