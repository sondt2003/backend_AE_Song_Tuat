const { model, Schema } = require("mongoose");
const { NotifyTypeConstant } = require("../constants/notify-type.constant");

const DOCUMENT_NAME = "OrderDetail";
const COLLECTION_NAME = "OrderDetails";

const OrderDetailSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product" , required: true },
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true  },
    price: { type: Number, required: true, ref: "Shop" , required: true },
    order_detail_products: { type: Array, required: true },
    variation: { type: Object, default: {} },
    discount_value:{
        type: Number,
    },
    discount_type:{
        type: String,
    },
    quantity:{
        type: Number,
        required: true
    },
    tax_amount:{
        type: Number,
        required: true
    },
    variant:{
        type: String,
    },
    total_add_on_price:{
        type: Number,
        required: true
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, OrderDetailSchema);
