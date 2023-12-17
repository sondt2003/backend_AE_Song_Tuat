const { BusinessLogicError } = require("../../core/error.response");
const { category } = require("../../models/categories.model");
const { convert2ObjectId, saveBase64Image, saveBase64ImageSharp } = require("../../utils");

class CategoryService {
  static async createCategory(payload) {
    const category_image = await saveBase64ImageSharp({base64Data:payload.category_image,width:payload.width,height:payload.height});
    return await category.create({
        ...payload,
        category_image
    });
  }

  static async getAllCategory({ limit = 50, page = 1 }) {
    const skip = (page - 1) * limit;

    return category
      .find()
      .populate(
        "category_parent_id",
        "category_name category_image category_priority"
      )
      .limit(limit)
      .skip(skip);
  }

  static async getMaxPage({ limit = 50, skip = 0 }) {
    let totalItem = await category.countDocuments();
    return Math.ceil(totalItem / limit);
  }

  static async updateCategory(categoryId, payload) {
    const category_image = await saveBase64ImageSharp({base64Data:payload.category_image,width:payload.width,height:payload.height});
    return category
      .findByIdAndUpdate(
        categoryId,
        {
          ...payload,
          category_image
        },
        { new: true }
      )
      .lean();
  }

  static async deleteCategory(categoryId) {
    return category.findByIdAndDelete(categoryId, { new: true }).lean();
  }
}

module.exports = {
  CategoryService,
};
