const app = require("express");
const route = app.Router();
const controller = require("../../../controllers/shop/profile.controller");
route.patch('/update', controller.UpdateProfile);
route.post('',controller.GetProfile)
module.exports = route;
