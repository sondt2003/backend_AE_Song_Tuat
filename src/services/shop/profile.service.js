const profileModel = require("../../models/profileUser.model");
const Shop = require("../../models/shop.model");

class ProfileService {
  static async UpdateProfile(body) {
    let { birthday, gender, phone, UserId } = body;

    let shop = await Shop.findById(UserId).populate("profile");

    if (shop.profile) {
      // Update existing profile
      await profileModel.findByIdAndUpdate(
        shop.profile,
        { $set: { birthday, gender, phone } },
        { new: true }
      );
    } else {
      // Create a new profile
      let newProfile = await profileModel.create({ birthday, gender, phone });
      shop.profile = newProfile._id; // Assign the profile ID, not the entire profile object
    }
    await shop.save();
    return shop;
  }
  static async GetProfile(UserId) {
    let shop = await Shop.findById(UserId).populate("profile");
    return shop;
  }
}
module.exports = ProfileService;
