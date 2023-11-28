const { CREATED } = require("../../../../core/success.response");
const catchAsync = require("../../../../helpers/catch.async");
const { signUp } = require("../../../../services/shop/access.service");
class StatisticalShopController {
  createShop = catchAsync(async (req, res) => {
    CREATED(res, "Tạo shop thành công", await signUp(req.body, "SHOP"));
  });
}
module.exports = new StatisticalShopController();
