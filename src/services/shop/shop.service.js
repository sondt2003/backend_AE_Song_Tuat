const shopModel = require("../../models/shop.model");
const bcrypt = require("bcrypt");
const { getInfoData } = require("../../utils");
const { Api403Error, Api404Error } = require("../../core/error.response");
const addressModel = require("../../models/address.model");

const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 2,
    status: 3,
    roles: 4,
    name: 5,
  },
}) => {
  return await shopModel.findOne({ email }).select(select).populate("address_id").lean();
};
class ShopService {
  static updateUser = async ({
    userId,
    name,
    avatar,
    email,
    password,
    msisdn,
    addressId,
    latitude,
    longitude,
  }) => {
    // step1: check email exists?
    const holderShop = await shopModel.findById(userId).lean();
    if (!holderShop) {
      throw new Api403Error("Thông tin shop đã Tồn Tại");
    }
    const foundAddress = await addressModel.findOne({_id:addressId,user_id:userId}).lean();
    if (!foundAddress) throw new Api404Error('Address not found')
 

    const passwordHash = await bcrypt.hash(password, 10);

    const updateShop = await shopModel.findByIdAndUpdate(
      userId,
      {
        name,
        avatar,
        email,
        password: passwordHash,
        msisdn,
        latitude,
        longitude,
        address_id:addressId
      },
      { new: true }
    ).populate("address_id");

    if (!updateShop) {
      return null;
    }
    return {
      shop: getInfoData({
        fields: [
          "_id",
          "name",
          "email",
          "msisdn",
          "address_id",
          "avatar",
        ],
        object: updateShop,
      }),
    };
  };
}
module.exports = {
  findByEmail,
  ShopService,
};
