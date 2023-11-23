const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/admin/statistics/product");

router.get("/count",controller.CountProduct)
router.get("",controller.AllProduct)
module.exports = router;
