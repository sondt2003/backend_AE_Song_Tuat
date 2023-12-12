const { BusinessLogicError } = require("../../core/error.response");
const orderModel = require("../order.model");
const { product } = require("../product.model");
const { Types } = require("mongoose");
const findById = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(unSelect);
};
/**
 * ?a[gte]=2&b[gt]=3&c[lte]=5&d[lt]=6
 *
 * @param queryInput
 * @return {Promise<void>}
 */


const advancedSearchFilter = async (queryInput) => {
  // const excludedFields = ["page", "sort", "size", "fields"];
  // excludedFields.forEach((el) => delete queryInput[el]);

  //1. advanced filtering
  let queryStr = JSON.stringify(queryInput);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  queryStr = JSON.parse(queryStr);
  

  console.log("queryStr::::::",queryStr);
  let query = orderModel.find({ ...queryInput.filter,...queryStr});

  //2. sorting
  if (queryInput.sort) {
      const sortBy = queryInput.sort.split(",").join(" ");
      console.log(sortBy);
      query = query.sort(sortBy);
  } else {
      query = query.sort("-createdAt");
  }

  //3. field limiting
  if (queryInput.fields) {
      const fields = queryInput.fields.split(",").join(" ");
      query = query.select(fields);
  } else {
      query = query.select("-__v");
  }

  //4. paging
  // page=0&size=10
  const page = queryInput.page * 1 || 1;
  const size = queryInput.limit * 1 || 100;
  const offset = (page - 1) * size;

  query = query.skip(offset).limit(size);

  if (queryInput.page) {
      const total = await orderModel.countDocuments();
      if (offset >= total)
          throw new BusinessLogicError("This page does not exists");
  }

  return await query;
};

const findAllOrders = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  return await orderModel.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(select)
      .lean();
}

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
  findAllOrders,
  advancedSearchFilter,
};
