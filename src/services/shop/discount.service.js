const { BusinessLogicError } = require("../../core/error.response");
const { convert2ObjectId } = require("../../utils");
const discountModel = require("../../models/discount.model");
const {
  findAllProducts,
  getProductById,
} = require("../../models/repositories/product.repo");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
} = require("../../models/repositories/discount.repo");
const RoleShop = require("../../utils/role.util");
const { forEach } = require("lodash");

class DiscountService {
  static async countDiscount() {
    let totalDiscount = await discountModel.countDocuments();
    return totalDiscount;
  }
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      users_used,
      value,
      max_value,
      max_users,
      users_count,
      max_uses_per_user,
      permissions,
    } = payload;

    // // validate
    // if (new Date() > new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BusinessLogicError("Discount code has expired");
    // }
    // validate
    
    if (new Date() > new Date(end_date)) {
      throw new BusinessLogicError("Discount code has expired");
    }
    
    if (new Date(end_date) < new Date(start_date)) {
      throw new BusinessLogicError("End date more than start date");
    }
    const isPermission = permissions.includes(RoleShop.ADMIN);

    // create index for discount code
    const foundDiscount = discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convert2ObjectId(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BusinessLogicError("Discount exists");
    }

    return await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_day: new Date(start_date),
      discount_end_day: new Date(end_date),
      discount_max_uses: max_users,
      discount_uses_count: users_count,
      discount_users_used: users_used,
      discount_shop_id: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
      discount_is_admin: isPermission,
    });
  }

  static async updateDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_users,
    } = payload;
  }

  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    console.log(
      "code::::::",
      code,
      "shopId::::::",
      shopId,
      "limit::::::",
      limit,
      "page::::::",
      page
    );
    // create index for discount_code
    const foundDiscount = await discountModel.findOne({
      discount_code: code,
      discount_shop_id: convert2ObjectId(shopId),
    });

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new BusinessLogicError("Discount not exists");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let filter;
    if (discount_applies_to === "all") {
      // get all
      filter = {
        product_shop: convert2ObjectId(shopId),
        isPublished: true,
      };
    }

    if (discount_applies_to === "specific") {
      // get by product ids
      filter = {
        _id: { $in: discount_product_ids },
        isPublished: true,
      };
    }

    return await findAllProducts({
      filter,
      limit: +limit,
      page: +page,
      sort: "ctime",
      select: ["product_name"],
    });
  }

  static async getAllDiscountApply({
    userId,
    limit,
    page,
  }) {
    const foundDiscount = await findAllDiscountCodesUnSelect({
      filter: {
        discount_is_active: true,
        // discount_applies_to: "all",
      },
      limit:limit,
      page:page,
      unSelect: ["__v", "discount_product_ids"],
      model: discountModel,
  });

  const filteredDiscounts = foundDiscount.filter(discount => {
      const idCount = discount.discount_users_used.filter(id => id === userId).length;
      console.log("idCount:",idCount,discount.discount_max_uses_per_user,"userId:",userId)
      console.log("idCount:BOLEEN",idCount >= discount.discount_max_uses_per_user)
      console.log("discount_users_used",discount.discount_users_used)
      const idNotPresent = !discount.discount_users_used.includes(userId);
      return idCount < discount.discount_max_uses_per_user || idNotPresent;
    });
    return await filteredDiscounts;
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    return await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convert2ObjectId(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shop_id"],
      model: discountModel,
    });
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        $or: [
          { _id: codeId, discount_shop_id: convert2ObjectId(shopId) },
          {
            discount_is_admin: true,
            _id: codeId,
          },
        ],
      },
    });
    if (!foundDiscount) {
      throw new BusinessLogicError("Discount not exists");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_day,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
      discount_applies_to,
      discount_product_ids
    } = foundDiscount;
    if (!discount_is_active) throw new BusinessLogicError("Discount expired");
    if (discount_max_uses === 0)
      throw new BusinessLogicError("Discount are out");

    if (
      new Date() < new Date(discount_start_day) ||
      new Date() > new Date(discount_end_date)
    )
      throw new BusinessLogicError("Discount code has expired");

    // check xem cos et gia tri toi thieu hay k
    let totalOrder = 0;

    if(discount_applies_to=="all"){
      if (discount_min_order_value > 0) {
        // get total
        totalOrder = await products.reduce(async (acc, product) => {
          const foundProduct = await getProductById(product.productId);
          if (!foundProduct) {
            throw new BusinessLogicError("Don't have product with product id");
          }
          return (await acc) + product.quantity * foundProduct.product_price;
        }, 0);
  
        if (totalOrder < discount_min_order_value) {
          throw new BusinessLogicError(
            `Discount requires a minium order value of ${discount_min_order_value}`
          );
        }
      }
    } else{
      const allProductsInDiscount = products.every(product => discount_product_ids.includes(product.productId));
      if(!allProductsInDiscount){
        throw new BusinessLogicError("Phiếu giảm giá không áp sản phẩm");
      }
      if (discount_min_order_value > 0) {
        // get total
        totalOrder = await products.reduce(async (acc, product) => {
          const foundProduct = await getProductById(product.productId);
          if (!foundProduct) {
            throw new BusinessLogicError("Don't have product with product id");
          }
          return (await acc) + product.quantity * foundProduct.product_price;
        }, 0);
  
        if (totalOrder < discount_min_order_value) {
          throw new BusinessLogicError(
            `Discount requires a minium order value of ${discount_min_order_value}`
          );
        }
      }
    }

    if (discount_max_uses_per_user > 0) {
      let count = 0;
      await discount_users_used.forEach((user) => {
        if (user === userId) {
          count++;
        }
      });
      if (count >= discount_max_uses_per_user) {
        throw new BusinessLogicError(
          `Bạn Đã sử dụng mã giảm giá này với số lần ${count}`
        );
      }
    }

    // check xem discount nay la fixed amount
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    console.log("amount", amount);
    console.log("discount_value", discount_value);
    console.log("totalOrder", totalOrder);
    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // delete voucher
  static async deleteDiscountCode({ shopId, codeId }) {
    // kiem tra xem co dk su dung o dau khong, neu k co thi xoa
    return discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shop_id: convert2ObjectId(shopId),
    });
  }

  //
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    // check exists
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        $or: [
          { _id: codeId, discount_shop_id: convert2ObjectId(shopId) },
          {
            discount_is_admin: true,
            _id: codeId,
          },
        ],
      },
    });

    if (!discountModel) throw new BusinessLogicError("Discount not exists");

    return discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
  }

  static async pushUsersUsed({ codeId, shopId, userId }) {
    // check exists
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        $or: [
          { _id: codeId, discount_shop_id: convert2ObjectId(shopId) },
          {
            discount_is_admin: true,
            _id: codeId,
          },
        ],
      },
    });

    if (!discountModel) throw new BusinessLogicError("Discount not exists");

    return discountModel.findByIdAndUpdate(foundDiscount._id, {
      $push: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: -1,
        discount_uses_count: 1,
      },
    });
  }
}

module.exports = {
  DiscountService,
};
