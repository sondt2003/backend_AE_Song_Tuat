const { BusinessLogicError } = require("../core/error.response");
const { product, food, clothing } = require("../models/product.model");
const { findAllDraftsForShop, findAllPublishForShop, publishProductByShop, searchProductByUser, findAllProducts, findById, getProductById,
    advancedSearch
} = require("../models/repositories/product.repo")
const { getSelectData, unGetSelectData } = require("../utils");

class ProductService {

    static productRegistry = {}

    static registerProductType(type, classRef) {
        ProductService.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductService.productRegistry[type]
        if (!productClass) throw new BusinessLogicError("Product type %s không hợp lệ")

        return new productClass(payload).createProduct()
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductService.productRegistry[type]
        if (!productClass) throw new BusinessLogicError("Product type %s không hợp lệ")

        return new productClass(payload).updateProduct(productId)
    }

    // PUT
    static async publishProductByShop({ product_shop, product_id }) {
        // find one
        return await publishProductByShop({ product_shop, product_id })
    }

    // query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async searchProducts({ keySearch }) {
        return await searchProductByUser({ keySearch })
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({ limit, sort, filter, page, select: getSelectData(['product_name', 'product_price', 'product_thumb', 'product_shop']) })
    }

    static async findOneProduct(product_id) {
        return await findById({ product_id, unSelect: unGetSelectData(['__v', 'variations']) })
    }

    static async findProductById(product_id) {
        return await getProductById(product_id);
    }

    static async advancedSearch(query) {
        return await advancedSearch(query);
    }
}
class Product {
    constructor({ product_name, product_thumb, product_description, product_price,
        product_type, product_shop, product_attributes, product_quality,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
        this.product_quality = product_quality;
    }
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }
}
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BusinessLogicError("Create new Clothing failed");
        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BusinessLogicError("Create new Product failed");

        return newProduct;
    }
    async updateProduct(product_id) {

    }
}

class Food extends Product {
    async createProduct() {
        const newFood = await food.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFood) throw new BusinessLogicError("Create new Clothing failed");
        const newProduct = await super.createProduct(newFood._id);
        if (!newProduct) throw new BusinessLogicError("Create new Product failed");

        return newProduct;
    }
    async updateProduct(product_id) {

    }
}
ProductService.registerProductType('Clothing', Clothing);
ProductService.registerProductType('Food', Food);
module.exports = {
    ProductService,
}
