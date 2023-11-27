const express = require("express");
const vnpayController = require("../../../controllers/shop/vnpay.controller");
const route = express.Router();

route.post("/createURLPayment",vnpayController.createPaymentUrl)


module.exports = route;
