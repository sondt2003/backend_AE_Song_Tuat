const { BusinessLogicError } = require('../core/error.response');
const { category } = require('../models/categories.model');
class CategoryService {

    static async createCategory(type, payload) {
        return await category.create({
            ...payload
        });
    }
    static async getAllCategory({ limit = 50, skip = 0 }) {
        return await category.find().limit(limit, skip);
    }
    static async updateCategory(type, categoryId, payload) {
        const categoryClass = CategoryService.categoryRegistry[type]
        if (!categoryClass) throw new BusinessLogicError("Category type %s không hợp lệ")

        return await category.findByIdAndUpdate(categoryId, {
            ...payload
        }, { new: true }).lean();
    }

    static async deleteCategory(categoryId) {
        const categoryClass = CategoryService.categoryRegistry[type]
        if (!categoryClass) throw new BusinessLogicError("Category type %s không hợp lệ")

        return await category.findByIdAndDelete(categoryId, { new: true }).lean();
    }
}
module.exports = {
    CategoryService,
}