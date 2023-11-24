const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserProfile";
const COLLECTION_NAME = "UserProfile";

const userProfilesSchema = new Schema(
  {
    birthday: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    // ... other fields for user profile
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, userSchema);
