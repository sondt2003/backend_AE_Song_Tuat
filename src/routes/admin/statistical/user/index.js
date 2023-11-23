const express = require("express");
const router = express.Router();
const controller = require("../../../../controllers/admin/statistics/user");



router.get("/count",controller.CountUser)
router.get("",controller.AllUser)



module.exports = router;
