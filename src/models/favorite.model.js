const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Favorite";
const COLLECTION_NAME = "Favorites";

const favoriteSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, favoriteSchema);
