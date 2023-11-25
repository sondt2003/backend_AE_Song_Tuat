const { OK } = require("../../core/success.response");
const catchAsync = require("../../helpers/catch.async");
const WalletService = require("../../services/shop/wallet.service");

class WalletController {
  payOff = async (req, res) => {
    catchAsync(
      OK(
        res,
        "Thanh toán thành công",
        await WalletService.Payoff(req.body.userId, req.body.amount)
      )
    );
  };
  deposit = async (req, res) => {
    catchAsync(
      OK(
        res,
        "Nạp tiền thành công",
        await WalletService.Depositing(req.body.userId, req.body.amount)
      )
    );
  };
  GetById = async (req,res) => {
    catchAsync(
      OK(res, "success", await WalletService.GetBalance(req.params.userId))
    );
  };
}
module.exports = new WalletController();
