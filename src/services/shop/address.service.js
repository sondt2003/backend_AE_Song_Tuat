const addressModel = require('../../models/address.model')
const { getProductById, getProductByIdUnselect } = require("../../models/repositories/product.repo");
const { Api404Error } = require("../../core/error.response");
const shopModel = require('../../models/shop.model');


class AddressService {
    static async createUserAddress({userId,isDefault, street, city,state,country,latitude,longitude }) {
        const shop =await shopModel.findById(userId).lean();
        if (!shop) throw new Api404Error('shop not found')
     
        const createAddress= await addressModel.create({ street, city,state,country,latitude,longitude ,user_id:userId})

        if(isDefault){
            const shop =await shopModel.findByIdAndUpdate(userId,{$set:{address_id:createAddress._id}}).lean()
           if (!shop) throw new Api404Error('shop not found')
        }
        return createAddress;
    }

    static async updateUserAddress({userId,addressId,isDefault,street, city,state,country,latitude,longitude }) {
        const foundAddress = await addressModel.findOne({_id:addressId,user_id:userId}).lean();
        if (!foundAddress) throw new Api404Error('Address not found')
        if(isDefault){
          const shop =await shopModel.findByIdAndUpdate(userId,{$set:{address_id:addressId}}).lean()
         if (!shop) throw new Api404Error('shop not found')
        }
        return await addressModel.findOneAndUpdate({_id:addressId,user_id:userId},{street, city,state,country,latitude,longitude},{new:true}).lean();
    }

    static async deleteAddress({ addressId ,userId}) {
        const foundAddress = await addressModel.findOne({_id:addressId,user_id:userId}).lean();
        if (!foundAddress) throw new Api404Error('address not found')

        const shop =await shopModel.findByIdAndUpdate(userId,{$unset:{address_id:addressId}}).lean()
           if (!shop) throw new Api404Error('shop not found')

        return await addressModel.findOneAndDelete({_id:addressId,user_id:userId}).lean();
    }
    static async getListUserAddress(userId) {
        return await addressModel.find({
            user_id: userId
        }).lean()
    }

    static async getUserAddressDetails({ addressId ,userId}) {
        const foundAddress=await addressModel.findOne({
            _id: addressId,
            user_id:userId
        }).lean();
        if (!foundAddress) throw new Api404Error('Address not found')
        return foundAddress;
    }
}

module.exports = {
    AddressService,
}