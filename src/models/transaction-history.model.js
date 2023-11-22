const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "TransactionHistory";
const COLLECTION_NAME = "TransactionHistories";

const transactionHistorySchema = new Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    payment_date_time: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
    },
    billing_information: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    comments: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, transactionHistorySchema);
