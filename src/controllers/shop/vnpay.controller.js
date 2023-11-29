const { Api401Error, Api403Error } = require("../../core/error.response");
const { OK } = require("../../core/success.response");
const catchAsync = require("../../helpers/catch.async");
const VnPayService = require("../../services/shop/vnpay.service");

class VnPayController {
  createPaymentUrl = async (req, res) => {
    catchAsync(
      OK(
        res,
        "tạo đường dẫn thanh toán thành công",
        await VnPayService.createPaymentUrl({
          amount: req.body.amount,
          code_bank: req.body.code_bank,
          userId:req.body.userId,typePayment: req.body.typePayment
        })  
      )
    );
  };
  vnPayReturn = (req,res)=>{
    catchAsync(OK(res,"Thanh toán thành công", VnPayService.checkMac(req)))
  } 


}
module.exports = new VnPayController();
