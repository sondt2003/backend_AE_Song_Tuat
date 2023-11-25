const express = require("express");
const walletController = require("../../../controllers/shop/wallet.controller");
const router = express.Router();

router.post("/deposit", walletController.deposit);
router.post("/payOff", walletController.payOff);
router.get("/:userId", walletController.GetById);

module.exports = router;
