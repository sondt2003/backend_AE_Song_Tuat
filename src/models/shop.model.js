const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

const shopSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    avatar: {
      type: String,
      trim: true,
      default:
        "https://3.bp.blogspot.com/-aFNY0f-9QVg/Ud77oaftMwI/AAAAAAAACkE/QgdoH-rdXu0/s1600/Hinh-Nen-Dep-P1-Sitetin+(20).jpg",
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    msisdn: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    profile:{
      type: Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    roles: {
      type: Array,
      default: [],
    },
    address_id: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, shopSchema);
