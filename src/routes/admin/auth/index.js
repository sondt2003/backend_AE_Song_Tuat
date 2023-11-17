const express = require("express");
const controller = require("../../../controllers/admin/access.controller");
const router = express.Router();

router.post("/register", controller.signUp);

router.post("/login", controller.login);
module.exports = router;

