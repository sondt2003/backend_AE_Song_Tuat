const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Profile";
const COLLECTION_NAME = "Profile";

const ProfileSchema = new Schema(
  {
    birthday: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, ProfileSchema);
