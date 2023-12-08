const {model, Schema} = require("mongoose");
const { product } = require("./product.model");

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const apiKeySchema = new Schema({
    cart_state: {
        type: String,
        require: true,
        enum: ['active', 'completed', 'fail', 'pending', 'lock'],
        default: 'active'
    }, //trạng thái giỏ hàng
    cart_products: {
        type: Array,
        require: true,
        default: []
    },//sản phầm giỏ hàng
    /**
     * {
     *     productId,
     *     shopId,
     *     quantity,
     *     name,
     *     price
     * }
     */
    cart_count_product: {
        type: Number,
        default: 0
    },//số lượng sản phẩm trong rỏ hàng
    // cart_user_id: {
    //     type: Number,
    //     require: true
    // }
    cart_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
});

apiKeySchema.post("findOne", async function (result, next) {
    if(result){
        for (let i = 0; i < result.cart_products.length; i++) {
            const item_products = result.cart_products[i];
            const foundProduct = await product.findById(item_products.productId)
                .select("image -_id").lean();

                result.cart_products[i] = {...foundProduct, ...item_products}
        }
    }
    next();
});

module.exports = model(DOCUMENT_NAME, apiKeySchema)