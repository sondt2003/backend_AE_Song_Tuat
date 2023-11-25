const shopModel = require("../../models/shop.model");
const bcrypt = require("bcrypt");
const { getInfoData, getSelectData } = require("../../utils");
const { Api403Error, Api404Error } = require("../../core/error.response");
const addressModel = require("../../models/address.model");
const RoleShop = require("../../utils/role.util");
const { AddressService } = require("./address.service");

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
  return await shopModel
    .findOne({ email })
    .select(select)
    .populate("address_id")
    .lean();
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
    const foundAddress = await addressModel
      .findOne({ _id: addressId, user_id: userId })
      .lean();
    if (!foundAddress) throw new Api404Error("Address not found");

    const passwordHash = await bcrypt.hash(password, 10);

    const updateShop = await shopModel
      .findByIdAndUpdate(
        userId,
        {
          name,
          avatar,
          email,
          password: passwordHash,
          msisdn,
          latitude,
          longitude,
          address_id: addressId,
        },
        { new: true }
      )
      .populate("address_id");

    if (!updateShop) {
      return null;
    }
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email", "msisdn", "address_id", "avatar"],
        object: updateShop,
      }),
    };
  };


  static updateUserV2 = async ({
    userId,
    name,
    avatar,
    email,
    password,
    msisdn,
    address: { street, city, state, country, latitude, longitude },
  }) => {
    // step1: check email exists?
    const holderShop = await shopModel.findById(userId).lean();
    if (!holderShop) {
      throw new Api403Error("Thông tin shop đã Tồn Tại");
    }
    if (holderShop.address_id) {
      await  AddressService.updateUserAddress({ userId,addressId:holderShop.address_id, street, city, state, country, latitude, longitude });
    } else {
      await AddressService.createUserAddress({ userId,isDefault:true, street, city, state, country, latitude, longitude });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updateShop = await shopModel
      .findByIdAndUpdate(
        userId,
        {
          name,
          avatar,
          email,
          password: passwordHash,
          msisdn,
          latitude,
          longitude,
        },
        { new: true }
      )
      .populate("address_id");

    if (!updateShop) {
      return null;
    }
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email", "msisdn", "address_id", "avatar"],
        object: updateShop,
      }),
    };
  };

  static listShop = async ({ limit = 50, sort = "ctime", page = 1 }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

    const foundShop = await shopModel
      .find({ roles: { $elemMatch: { $eq: RoleShop.SHOP } } })
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(["avatar", "name", "address_id"]))
      .populate("address_id");
    return foundShop;
  };
}
module.exports = {
  findByEmail,
  ShopService,
};
