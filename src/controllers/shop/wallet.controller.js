const {OK} = require("../../core/success.response");
const catchAsync = require("../../helpers/catch.async");
const WalletService = require("../../services/shop/wallet.service");

class WalletController {
    payOff = catchAsync(async (req, res) => {
        OK(
            res,
            "Thanh toán thành công",
            await WalletService.Payoff(req.body)
        )
    })

    deposit = catchAsync(async (req, res) => {

        OK(
            res,
            "Nạp tiền thành công",
            await WalletService.Depositing(req.body.userId, req.body.amount)
        )

    });
    GetById = catchAsync(async (req, res) => {
        OK(res, "success", await WalletService.GetBalance(req.params.userId))
    });

}

module.exports = new WalletController();
