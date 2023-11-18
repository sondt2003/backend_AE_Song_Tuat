const express = require("express");
const router = express.Router();
const { apiKey, permission } = require("../../auth/checkAuth");
router.use(apiKey);
router.use("/api/v1/admin", require("./auth"));
router.use("/api/v1/admin/statistical", require("./statistical"));

module.exports = router;
