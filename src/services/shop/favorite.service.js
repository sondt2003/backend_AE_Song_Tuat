const { getProductById, getProductByIdUnselect } = require("../../models/repositories/product.repo");
const { Api404Error } = require("../../core/error.response");
const favoriteModel = require("../../models/favorite.model");
const {product} = require("../../models/product.model");


class FavoriteService {
    static async createUserFavorite({ productId, userId}) {
        const foundProduct =await product.findById(productId)
        if (!foundProduct) throw new Api404Error('Product not found')
        return (await favoriteModel.create({ product_id:productId, user_id:userId})).populate("product_id")
    }

    static async updateUserFavorite({ favoriteId, userId,productId}) {
        const foundFavorite =await favoriteModel.findOne({_id:favoriteId,user_id:userId})
        if (!foundFavorite) throw new Api404Error('favorite not found')
     
        const foundProduct =await product.findById(productId)
        if (!foundProduct) throw new Api404Error('Product not found')

        return await favoriteModel.findOneAndUpdate({_id:favoriteId,user_id:userId},{ product_id:productId},{new:true}).populate("product_id").lean();
    }

    static async deleteFavorite({ favoriteId, userId,productId}) {
        const deleteFavorite =await favoriteModel.findOneAndDelete({_id:favoriteId,product_id:productId,user_id:userId}).populate("product_id").lean()
        if (!deleteFavorite) throw new Api404Error('Favorite not found')

        return deleteFavorite;
    }
    static async getListUserFavorite(userId) {
        return await favoriteModel.find({
            user_id: userId
        }).populate("product_id").lean()
    }

    static async getUserFavoriteDetails({ favoriteId ,userId}) {
        const foundFavorite=await favoriteModel.findOne({_id:favoriteId,user_id:userId}).populate("product_id").lean();
        if (!foundFavorite) throw new Api404Error('Favorite not found')
        return foundFavorite;
    }
}

module.exports = {
    FavoriteService,
}