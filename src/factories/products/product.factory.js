const {product} = require("../../models/product.model");
const {insertInventory} = require("../../models/repositories/inventory.repo");
const {pushNotificationToSystem} = require("../../services/notification.service");
const {NotifyTypeConstant} = require("../../constants/notify-type.constant");

class ProductFactory {
    constructor({
                    product_name, product_thumb, product_description, product_price,
                    product_type, product_shop, product_attributes, product_quality
                }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_quality = product_quality
    }

    // create new Product
    async createProduct(product_id) {
        const newProduct = await product.create({...this, _id: product_id})

        if (newProduct) {
            // add product_stock in inventory collections
            const invenData = await insertInventory({
                productId: product_id,
                shopId: this.product_shop,
                stock: this.product_quality
            })

            // push noti to system collect
            pushNotificationToSystem({
                type: NotifyTypeConstant.SHOP_001,
                receivedId: 1,
                senderId: this.product_shop,
                options: {
                    product_name: this.product_name,
                    shop_name: this.product_shop
                }
            })
            .then(res => console.log(res))
            .catch(console.error)

            console.log(`invenData::`, invenData)
        }

        return newProduct
    }

    // update product
    async updateProduct(productId, bodyUpdate) {
        return await product.findByIdAndUpdate(productId, bodyUpdate, {
            new: true
        })
    }
}

module.exports = {
    ProductFactory
}
