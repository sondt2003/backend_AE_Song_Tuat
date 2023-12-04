const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Wallet";
const COLLECTION_NAME = "Wallet";

const walletSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, walletSchema);
