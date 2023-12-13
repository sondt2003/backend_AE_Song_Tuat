const { BusinessLogicError } = require("../../core/error.response");
const { product, food, clothing } = require("../../models/product.model");
const { insertInventory } = require("../../models/repositories/inventory.repo");
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  searchProductByUser,
  findAllProducts,
  findById,
  getProductById,
  advancedSearch,
  findByIdAndDiscount,
  findAllProductsCategory,
  draftProductByShop,
} = require("../../models/repositories/product.repo");
const {
  getSelectData,
  unGetSelectData,
  convert2ObjectId,
  saveBase64Image,
  deleteImage,
} = require("../../utils");

class ProductService {
  static productRegistry = {};
  static registerProductType(type, classRef) {
    ProductService.productRegistry[type] = classRef;
  }
  static async createProduct(type, payload) {
    const productClass = ProductService.productRegistry[type];
    if (!productClass)
      throw new BusinessLogicError("Product type %s không hợp lệ");
    return new productClass(payload).createProduct();
  }
  static async updateProduct(type, productId, payload) {
    const productClass = ProductService.productRegistry[type];
    if (!productClass)
      throw new BusinessLogicError("Product type %s không hợp lệ");

    return new productClass(payload).updateProduct(productId);
  }
  // PUT
  static async publishProductByShop({ product_shop, product_id }) {
    // find one
    return await publishProductByShop({ product_shop, product_id });
  }
  // query
  static async findAllDraftsForShop({ limit = 50, skip = 0 }) {
    const query = { isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
    categoryId,
  }) {
    if (categoryId) {
      return await findAllProductsCategory({
        limit,
        sort,
        filter: { isPublished: true, categoryId: convert2ObjectId(categoryId) },
        page,
        select: getSelectData([
          "product_name",
          "product_price",
          "product_thumb",
          "product_shop",
          "image",
          "product_distance",
        ]),
      });
    } else {
      console.log("---------------------------------", limit, page);
      return await findAllProducts({
        limit,
        sort,
        filter,
        page,
        select: getSelectData([
          "product_name",
          "product_distance",
          "product_price",
          "product_thumb",
          "product_shop",
          "image",
          "categoryId",
        ]),
      });
    }
  }
  static async draftProductByShop({ product_id }) {
    return await draftProductByShop({ product_id });
  }
  static async findOneProduct(product_id, isDiscount = false) {
    return await findByIdAndDiscount({
      product_id,
      isDiscount,
      unSelect: unGetSelectData(["__v", "variations"]),
    });
  }
  static async findProductById(product_id) {
    return await getProductById(product_id);
  }
  static async advancedSearch(query) {
    return await advancedSearch(query);
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quality,
    categoryId,
    image,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quality = product_quality;
    this.categoryId = categoryId;
    this.image = image;
  }

  async createProduct(product_id) {
    const image = await saveBase64Image(this.image);
    const attributes_images=[];
    await this.product_attributes.images.forEach(async (image, index) => {
      attributes_images.push(await saveBase64Image(image,index))
    });
    this.product_attributes.images=attributes_images;
    
    const newProduct = await product.create({ ...this, _id: product_id ,image});
    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: newProduct.product_shop,
        stock: newProduct.product_quality,
      });
    }
    return newProduct;
  }

  async updateProduct(product_id) {
    const foundProduct=await product.findById(product_id).lean();

    await deleteImage(foundProduct.image)
    await foundProduct.product_attributes.images.forEach(async (image, index) => {
      console.log("IMAG::::::::::",image)
      await deleteImage(image)
    });

    const image = await saveBase64Image(this.image);
    const attributes_images = await Promise.all(
      this.product_attributes.images.map(async (image, index) => {
        return await saveBase64Image(image, index);
      })
    );
    
    

    this.product_attributes.images= attributes_images;
    console.log("attributes_images:",attributes_images)
    console.log("this.product_attributes.images:",this.product_attributes.images)
    return await product.findByIdAndUpdate(
      product_id,
      { ...this, _id: product_id ,image},
      {
        new: true,
      }
    );
  }

  removeProperty(newProduct) {
    const Product = {
      ...newProduct._doc,
      _id: null,
      createdAt: null,
      updatedAt: null,
      __v: null,
    };
    delete Product["_id"];
    delete Product["product_shop"];
    delete Product["createdAt"];
    delete Product["updatedAt"];
    delete Product["__v"];
    this.product_attributes = Product;
    console.log(
      "=============================== removeProperty ============================"
    );
    console.log({ ...this.product_attributes });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    super.removeProperty(newClothing);
    if (!newClothing)
      throw new BusinessLogicError("Create new Clothing failed");
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BusinessLogicError("Create new Product failed");

    return newProduct;
  }

  async updateProduct(product_id) {}
}

class Food extends Product {
  async createProduct() {
    const newFood = await food.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    super.removeProperty(newFood);
    if (!newFood) throw new BusinessLogicError("Create new Food failed");
    const newProduct = await super.createProduct(newFood._id);
    if (!newProduct) throw new BusinessLogicError("Create new Food failed");
    return newProduct;
  }

  async updateProduct(product_id) {
    const isFood = await food.findOne({
      _id: product_id,
      ...this.product_shop,
    });
    if (!isFood) throw new BusinessLogicError("Product not found");

    const updateFood = await food.findOneAndUpdate(
      { _id: product_id, ...this.product_shop },
      {
        ...this.product_attributes,
        product_shop: this.product_shop,
      },
      {
        new: true,
      }
    );
    super.removeProperty(updateFood);
    if (!updateFood) throw new BusinessLogicError("update Food failed");
    const updateProduct = await super.updateProduct(updateFood._id);
    if (!updateProduct)
      throw new BusinessLogicError("Create new Product failed");

    return updateProduct;
  }
}

ProductService.registerProductType("Clothing", Clothing);
ProductService.registerProductType("Food", Food);
module.exports = {
  ProductService,
};
