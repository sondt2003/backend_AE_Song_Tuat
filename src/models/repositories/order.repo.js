const { BusinessLogicError } = require("../../core/error.response");
const { product } = require("../product.model");
const { Types } = require("mongoose");
const findById = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unSelect);
};
// const updateOrder = async ({
//     filter,
//     bodyUpdate,
//     model,
//     isNew = true
// }) => {
//     return await model.findOneAndUpdate(filter, bodyUpdate, {
//         new: isNew
//     })
// }

class OrderUpdater {
  constructor() {
    this.filter = {};
    this.bodyUpdate = {};
    this.model = null;
    this.isNew = true;
  }

  setFilter(filter) {
    this.filter = filter;
    return this;
  }

  setBodyUpdate(bodyUpdate) {
    this.bodyUpdate = bodyUpdate;
    return this;
  }

  setModel(model) {
    this.model = model;
    return this;
  }

  setIsNew(isNew) {
    this.isNew = isNew;
    return this;
  }

  async executeUpdate() {
    if (!this.model) {
      throw new BusinessLogicError("Model is required");
    }

    return await this.model.findOneAndUpdate(this.filter, this.bodyUpdate, {
      new: this.isNew,
    });
  }
}
module.exports = {
  findById,
  OrderUpdater,
};
