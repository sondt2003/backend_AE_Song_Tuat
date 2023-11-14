const { BusinessLogicError } = require('../../core/error.response');
const { category } = require('../../models/categories.model');
const { convert2ObjectId } = require('../../utils');
class CategoryService {

    static async createCategory(type, payload) {
        if(payload.category_parent_id){
            const foundCategory=await category.findById(convert2ObjectId(payload.category_parent_id)).lean().exec();
            if(foundCategory.category_parent_id){
                if (foundCategory.category_parent_id) throw new BusinessLogicError("Category Đã có parent category")
            }
        }
        return await category.create({
            ...payload
        });
    }
    static async getAllCategory({ limit = 50, skip = 0 }) {
        return await category.find().populate('category_parent_id','category_name category_image category_priority',).limit(limit, skip);
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