const {CategoryService} = require('../services/category.service')
const catchAsync = require('../helpers/catch.async')
const {OK} = require("../core/success.response");

class CategoryController {
    createCategory = catchAsync(async(req, res, next) => {
        OK(res,  "Create Category success", await CategoryService.createCategory(req.body.type,req.body))
    });

    getAllCategory = catchAsync(async(req, res, next) => {
        OK(res,  "Create Category success", await CategoryService.getAllCategory(req.query))
    });
    updateCategory = catchAsync(async(req, res, next) => {
        OK(res,  "Get Category success", await CategoryService.updateCategory(req.params.categoryId,req.body))
    });

    deleteCategory =  catchAsync(async(req, res, next) => {
        OK(res,  "Delete Category success", await CategoryService.deleteCategory(req.params.categoryId))
    });
}

module.exports = new CategoryController()