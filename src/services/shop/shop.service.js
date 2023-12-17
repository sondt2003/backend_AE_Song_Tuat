const shopModel = require("../../models/shop.model");
const bcrypt = require("bcrypt");
const {getInfoData, getSelectData, deleteImage, saveBase64Image} = require("../../utils");
const {Api403Error, Api404Error} = require("../../core/error.response");
const addressModel = require("../../models/address.model");
const RoleShop = require("../../utils/role.util");
const {AddressService} = require("./address.service");

const findByEmail = async ({
                               email,
                               select = {
                                   email: 1,
                                   password: 2,
                                   status: 3,
                                   roles: 4,
                                   name: 5,
                                   avatar:6,
                                   msisdn:7,
                               },
                           }) => {
    return await shopModel
        .findOne({email})
        .select(select)
        .populate("address_id")
        .lean();
};

const findByIdShop = async ({_id, select = {
    // email: 1,
    // password: 2,
    // status: 3,
    // roles: 4,
    name: 5,
    avatar:6,
    msisdn:7,
    },}) => {
return await shopModel
.findOne({_id:_id})
.select(select)
// .populate("address_id")
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
                               }) => {
        // step1: check email exists?
        const holderShop = await shopModel.findById(userId).lean();
        if (!holderShop) {
            throw new Api403Error("Thông tin shop đã Tồn Tại");
        }
        if(addressId){
            const foundAddress = await addressModel
            .findOne({_id: addressId, user_id: userId})
            .lean();
         if (!foundAddress) throw new Api404Error("Address not found");
        }
        if(password){
            password = await bcrypt.hash(password, 10);
        }
        const image = await saveBase64Image(avatar);
        const updateShop = await shopModel
            .findByIdAndUpdate(
                userId,
                {
                    name,
                    avatar:image,
                    email,
                    password,
                    msisdn,
                    address_id: addressId,
                },
                {new: true}
            )
            .populate("address_id");

        if (!updateShop) {
            return null;
        }
        await deleteImage(holderShop.avatar);
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
                                     address: {street, city, state, country, latitude, longitude},
                                 }) => {
        // step1: check email exists?
        const holderShop = await shopModel.findById(userId).lean();
        if (!holderShop) {
            throw new Api403Error("Thông tin shop đã Tồn Tại");
        }
        if (holderShop.address_id) {
            await AddressService.updateUserAddress({
                userId,
                addressId: holderShop.address_id,
                street,
                city,
                state,
                country,
                latitude,
                longitude
            });
        } else {
            await AddressService.createUserAddress({
                userId,
                isDefault: true,
                street,
                city,
                state,
                country,
                latitude,
                longitude
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const image = await saveBase64Image(avatar);
        const updateShop = await shopModel
            .findByIdAndUpdate(
                userId,
                {
                    name,
                    avatar:image,
                    email,
                    password: passwordHash,
                    msisdn,
                    latitude,
                    longitude,
                },
                {new: true}
            )
            .populate("address_id");

        if (!updateShop) {
            return null;
        }

        await deleteImage(holderShop.avatar);
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email", "msisdn", "address_id", "avatar"],
                object: updateShop,
            }),
        };
    };

    static listShop = async ({limit = 50, sort = "ctime", page = 1}) => {
        const skip = (page - 1) * limit;
        const sortBy = sort === "ctime" ? {_id: -1} : {_id: 1};

        const foundShop = await shopModel
            .find({roles: {$elemMatch: {$eq: RoleShop.SHOP}}})
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .select(getSelectData(["avatar", "name", "address_id"]))
            .populate("address_id");
        return foundShop;
    };
}

module.exports = {
    findByEmail,findByIdShop,
    ShopService,
};
