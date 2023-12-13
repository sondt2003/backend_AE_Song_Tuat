const express = require("express");
const {apiKey, permission} = require("../../auth/checkAuth");
const RoleShop = require("../../utils/role.util");
const shopController = require("../../controllers/shop/shop.controller");
const router = express.Router();

// health check application
router.use("/healthcheck", require("./health"));

router.use("/zone", require("./zone"));
router.use("/api/v1/vnpay", require("./vnpay"));
router.use("/api/v1/notify", require("./notify_user"))

// check apiKey
router.use(apiKey);

router.use("/api/v1/cart", require("./cart"));
router.use("/api/v1/order", require("./order"));
router.use("/api/v1/comment", require("./comment"));
router.use("/api/v1/user", require("../user"));
router.use("/api/v1/shop", require("./shop"));
router.use("/api/v1/address", require("./address"));
router.use("/api/v1/favorite", require("./favorite"));
router.use("/api/v1/auth", require("./auth"));
router.use("/api/v1/product", require("./product/search"));
router.use("/api/v1/category", require("./category"));
router.use("/api/v1/discount", require("./discount/search"));
router.use("/api/v1/transaction-history", require("./transaction-history"));
router.use("/api/v1/profile", require("./profile"));
router.use("/api/v1/wallet", require("./wallet"));
// check permission
router.use(permission([RoleShop.ADMIN,RoleShop.SHOP]));

router.use("/api/v1/inventory", require("./inventory"));
router.use("/api/v1/discount", require("./discount"));
router.use("/api/v1/product", require("./product"));
router.use("/api/v1/product", require("./product/admin"));
router.use("/api/v1/category", require("./category"));
module.exports = router;
