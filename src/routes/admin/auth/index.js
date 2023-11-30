const express = require("express");
const controller = require("../../../controllers/admin/access.controller");

const validation = require("../../../middleware/validators/access.validator");

const router = express.Router();

router.post("/register", validation.validateLoginRequest, controller.signUp);

router.post("/login", validation.validateLoginRequest, controller.login);


module.exports = router;
