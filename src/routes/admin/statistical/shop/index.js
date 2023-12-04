const express = require("express");
const { createShop } = require("../../../../controllers/admin/statistics/shop");
const router = express.Router();

router.post('/create', createShop);

module.exports = router;
