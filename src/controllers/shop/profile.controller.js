const { OK } = require("../../core/success.response");
const catchAsync = require("../../helpers/catch.async");
const profileService = require("../../services/shop/profile.service");

class ProfileController {
  UpdateProfile = async (req, res) => {
    catchAsync(
      OK(
        res,
        "Profile updated successfully",
        await profileService.UpdateProfile(req.body)
      )
    );
  };
  GetProfile = async (req, res) => {
    catchAsync(
      OK(
        res,
        "Profile get successfully",
        await profileService.GetProfile(req.body.UserId)
      )
    );
  };
}

module.exports = new ProfileController();
