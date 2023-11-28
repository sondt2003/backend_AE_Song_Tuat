const { model, Schema } = require("mongoose");
const { product } = require("./product.model");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    order_userId: { type: Schema.Types.ObjectId, ref: "Shop" },
    order_checkout: { type: Object, default: {} },
    /* order_checkout={
        totalPrice,
        totalApplyDiscount,
        feeShip,
    }*/
    order_shipping: { type: Object, default: {} },
    /* order_shipping={
        street,
        city,
        state,
        country,
    }*/
    order_payment: {
      type: String,
      require: true,
      enum: [
        "credit_card ",
        "pay_pal",
        "bank_transfer",
        "cash_on_Delivery",
        "cryptocurrency",
        "e_wallets",
        "cheque",
        "mobile_payment",
      ],
      default: "cash_on_Delivery",
    },
    order_products: { type: Array, required: true },
    order_trackingNumber: { type: String, default: "#000011237128" },
    order_status: {
      type: String,
      require: true,
      enum: ["pending", "confirmed", "shipped", "canceled", "delivered"],
      default: "pending",
    },
    //pending dơn hàng đang chờ  đã được tạo nhưng chưa được sử lý
    //confirmed dơn hàng đã được xử lý và xác nhận bởi người bán
    //shipped dơn hàng đã được vận chuyển và trên dường đến nơi
    //canceled dơn hàng đã bị hủy bởi khác hàng hoặc người bán
    //delivered đơn hàng đã giao tới khách hàng
    order_reason:{
      type: String,
    },
    isBasket: {
      type: Schema.Types.Boolean,
      default: "false",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "modifiedOn",
    },
  }
);
orderSchema.post("find", async function (result, next) {
for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result[i].order_products.length; j++) {
    for (let x = 0; x < result[i].order_products[j].item_products.length; x++) {
        const item_products=result[i].order_products[j].item_products[x];
        const foundProduct=await product.findById(item_products.productId)
        .select("product_name image -_id").lean(); 

        result[i].order_products[j].item_products[x]={...foundProduct,...item_products}
    }
    }
}
  next();
});

orderSchema.post("findOne", async function (result, next) {
  if(result) {
    for (let j = 0; j < result.order_products.length; j++) {
      for (let x = 0; x < result.order_products[j].item_products.length; x++) {
          const item_products=result.order_products[j].item_products[x];
          const foundProduct=await product.findById(item_products.productId)
          .select("-_id -price -product_quality -__v").lean(); 
          result.order_products[j].item_products[x]={...foundProduct,...item_products}
      }
      }
  }
    next();
    });
module.exports = model(DOCUMENT_NAME, orderSchema);
