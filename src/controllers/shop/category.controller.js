const {CategoryService} = require('../../services/shop/category.service')
const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");

class CategoryController {
    createCategory = catchAsync(async (req, res, next) => {
        OK(res, "Create Category success", await CategoryService.createCategory(req.body))
    });

    getAllCategory = catchAsync(async (req, res, next) => {

        OK(res, "Get All Category success", await CategoryService.getAllCategory(req.query), {
            maxPage: await CategoryService.getMaxPage(req.query)
        })
    });
    updateCategory = catchAsync(async (req, res, next) => {
        OK(res, "Update Category success", await CategoryService.updateCategory(req.params.categoryId, req.body))
    });

    deleteCategory = catchAsync(async (req, res, next) => {
        OK(res, "Delete Category success", await CategoryService.deleteCategory(req.params.categoryId))
    });
}

module.exports = new CategoryController()