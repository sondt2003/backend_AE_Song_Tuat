const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");
const { FavoriteService } = require('../../services/shop/favorite.service');

class FavoriteController {
    createUserFavorite = catchAsync(async(req, res, next) => {
        OK(res,  "create User Favorite success", await FavoriteService.createUserFavorite({userId: req.user.userId,...req.body}))
    });

    updateUserFavorite = catchAsync(async(req, res, next) => {
        OK(res,  "Update User Favorite success", await FavoriteService.updateUserFavorite({userId: req.user.userId,favoriteId:req.params.favoriteId,...req.body}))
    });
    deleteFavorite = catchAsync(async(req, res, next) => {
        OK(res,  "delete Favorite success", await FavoriteService.deleteFavorite({favoriteId:req.params.favoriteId,...req.body}))
    });

    getListUserFavorite =  catchAsync(async(req, res, next) => {
        OK(res,  "get List User Favorite", await FavoriteService.getListUserFavorite(req.user.userId))
    });



    getUserFavoriteDetails =  catchAsync(async(req, res, next) => {
        OK(res,  "get User Favorite Details", await FavoriteService.getUserFavoriteDetails({userId: req.user.userId,favoriteId:req.params.favoriteId}))
    });
}

module.exports = new FavoriteController()