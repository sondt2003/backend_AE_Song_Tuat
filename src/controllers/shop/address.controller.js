const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");
const { AddressService } = require('../../services/shop/address.service');

class AddressController {
    createUserAddress = catchAsync(async(req, res, next) => {
        OK(res,  "create User Address success", await AddressService.createUserAddress({userId: req.user.userId,...req.body}))
    });
    createShopAddress = catchAsync(async(req, res, next) => {
        OK(res,  "create SHop Address success", await AddressService.createUserAddress({userId: req.params.shopId,...req.body}))
    });

    updateUserAddress = catchAsync(async(req, res, next) => {
        OK(res,  "Update User Address success", await AddressService.updateUserAddress({userId: req.user.userId,addressId:req.params.addressId,...req.body}))
    });
    deleteAddress = catchAsync(async(req, res, next) => {
        OK(res,  "delete Address success", await AddressService.deleteAddress({userId: req.user.userId,addressId:req.params.addressId}))
    });

    getListUserAddress =  catchAsync(async(req, res, next) => {
        OK(res,  "get List User Address", await AddressService.getListUserAddress(req.user.userId))
    });

    getUserAddressDetails =  catchAsync(async(req, res, next) => {
        OK(res,  "get User Favorite Details", await AddressService.getUserAddressDetails({userId: req.user.userId,addressId:req.params.addressId}))
    });
}

module.exports = new AddressController()