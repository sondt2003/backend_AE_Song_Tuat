const adminAccessService = require("../../services/admin/access.service"); // Update the service import
const catchAsync = require("../../helpers/catch.async");
const { CREATED, OK } = require("../../core/success.response");

class AdminAccessController {
  login = catchAsync(async (req, res) => {
    OK(res, "Login success", await adminAccessService.signIn(req.body)); // Update service method name
  });

  
  refreshToken = catchAsync(async (req, res) => {
    OK(
      res,
      "Get token success",
      await adminAccessService.refreshToken({
        refreshToken: req.refreshToken,
        admin: req.admin, // Update user to admin
        keyStore: req.keyStore,
      })
    );
  });

  logout = catchAsync(async (req, res) => {
    OK(res, "Logout success", await adminAccessService.logout(req.keyStore));
  });

  signUp = catchAsync(async (req, res) => {
    CREATED(res, "Register success", await adminAccessService.signUp(req.body));
  });
}

module.exports = new AdminAccessController();
