const {model, Schema} = require("mongoose");

// hang ton kho
const DOCUMENT_NAME = 'Category';
const COLLECTION_NAME = 'Categories';

const categorySchema = new Schema({
    category_name: {
        type: String,
        default: 'unKnow'
    },
    category_image: {
        type: Number,
        required: true
    },
    category_parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    category_position:{
        type: Number,
       default:0,
    },
    category_status: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    category_priority: {
        type: Number,
        default:0,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, categorySchema)