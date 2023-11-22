const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Address";
const COLLECTION_NAME = "Address";

const addressSchema = new Schema(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, addressSchema);
