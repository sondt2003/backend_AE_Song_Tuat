const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const { getInfoData } = require("../utils");
const { Api403Error } = require("../core/error.response");

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
  return await shopModel.findOne({ email }).select(select).lean();
};
class ShopService {
  static updateUser = async ({
    userId,
    name,
    avatar,
    email,
    password,
    msisdn,
    address,
    latitude,
    longitude,
  }) => {
    // step1: check email exists?
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new Api403Error("Thông tin shop đã Tồn Tại");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updateShop = await shopModel.findByIdAndUpdate(
      userId,
      {
        name,
        avatar,
        email,
        password: passwordHash,
        msisdn,
        address,
        latitude,
        longitude,
      },
      { new: true }
    );

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
          "address",
          "avatar",
          "latitude",
          "longitude",
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
