const express = require("express")
const controller = require("../../../controllers/shop/notifyuser.controller")
const route = express.Router();
route.post("", controller.putNotify)

// todo notify user
module.exports = route;