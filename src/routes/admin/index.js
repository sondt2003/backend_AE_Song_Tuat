const express = require("express");
const router = express.Router();
const { apiKey } = require("../../auth/checkAuth");
router.use(apiKey);
router.use("/api/v1/admin", require("./auth"));
router.use("/api/v1/statistical", require("./statistical"));
module.exports = router;
