const express = require("express");
const router = express.Router();

router.use("/user", require("./user"));
router.use("/product", require("./product"));
router.use("/shop", require("./shop"));
router.use('/order', require("./order"))
router.use('/discount', require("./discount"))
module.exports = router;
