const { model, Schema } = require("mongoose");

// hang ton kho
const DOCUMENT_NAME = 'Category';
const COLLECTION_NAME = 'Categories';

const categorySchema = new Schema({
    category_name: {
        required: true,
        type: String,
        unique: true,
        trim: true
    },
    category_image: {
        type: String,
        required: true
    },
    category_parent_id: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    category_position: {
        type: Number,
        default: 0,
    },
    category_priority: {
        type: Number,
        default: 0,
    },
    isDraft: {
        type: Boolean,
        default: false, // khong dk select ra
        index: true,
        select: false // khong lay field nay ra
    },
    isPublished: {
        type: Boolean,
        default: true, // khong dk select ra
        index: true,
        select: false // khong lay field nay ra
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = {
    category: model('Category', categorySchema)
}