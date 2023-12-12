const express = require("express").Router();
const controller = require("../../../../controllers/admin/statistics/discount");

express.get("/count",controller.CountDiscount);

//another
module.exports = express;
