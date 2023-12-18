const {product} = require("../product.model");
const {Types} = require("mongoose");
const {convert2ObjectId} = require("../../utils");
const {
    BusinessLogicError,
    Api404Error,
} = require("../../core/error.response");
const ApiFeatures = require("./../../utils/api-feature.util");
const discountModel = require("../discount.model");
const {
    findAllDiscountCodesSelect,
    findAllDiscountCodesUnSelect,
} = require("./discount.repo");
const Comment = require("../comment.model")
const publishProductByShop = async ({product_shop, product_id}) => {
    // find one
    const foundShop = await product.findOne({
        // product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });
    if (!foundShop) return foundShop;

    // update isDraft, isPublish
    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const {modifiedCount} = await foundShop.update(foundShop);

    return modifiedCount;
};

const draftProductByShop = async ({product_id}) => {
    // find one
    const foundShop = await product.findOne({
        // product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return foundShop;

    // update isDraft, isPublish
    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const {modifiedCount} = await foundShop.update(foundShop);

    return modifiedCount;
};

const findAllDraftsForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip});
};

const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip});
};

// search full text
const searchProductByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch);

    console.log(`Searching : ${regexSearch}`);
    return await product
        .find({
            isPublished: true,
            // $text: { $search: regexSearch }
            $or: [
                {product_name: {$regex: keySearch, $options: "i"}},
                {product_description: {$regex: keySearch, $options: "i"}},
            ],
        })
        .sort()
        .lean();
};

const findAllProducts = async ({limit, sort, page, filter, select}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? {_id: -1} : {_id: 1};
    return await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
};

const findAllProductsCategory = async ({
                                           limit,
                                           sort,
                                           page,
                                           filter,
                                           select,
                                       }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? {_id: -1} : {_id: 1};
    return await product
        .find(filter)
        .populate("categoryId")
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
};
const findById = async ({product_id, unSelect}) => {
    return await product.findById(product_id).select(unSelect);
};
const getProductByIdUnselect = async ({productId, select}) => {
    return await product
        .findOne({_id: convert2ObjectId(productId)})
        .select(select);
};
const findByIdAndDiscount = async ({product_id, unSelect, isDiscount}) => {
    const foundFood = await product
        .findOne({_id: product_id, isPublished: true})
        .select(unSelect)
        .lean();

    if (!foundFood) throw new Api404Error("shop not found");

    if (isDiscount) {
        const foundDiscount = await findAllDiscountCodesUnSelect({
            filter: {
                $or: [
                    {
                        discount_is_active: true,
                        discount_applies_to: "all",
                    },
                    {
                        discount_product_ids: product_id,
                        discount_is_active: true,
                    },
                ],
            },
            unSelect: ["__v", "discount_product_ids", "discount_users_used"],
            model: discountModel,
        });

        return {
            ...foundFood,
            discount: foundDiscount,
        };
    } else {
        return foundFood;
    }
};

const queryProduct = async ({query, limit, skip}) => {
    return await product
        .find(query)
        .populate("product_shop", "name email")
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

const updateProductById = async ({
                                     productId,
                                     bodyUpdate,
                                     model,
                                     isNew = true,
                                 }) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, {
        new: isNew,
    });
};

const getProductById = async (productId) => {
    return await product.findOne({_id: convert2ObjectId(productId)}).lean();
};

const checkProductByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            const foundProduct = await getProductById(product.productId);
            if (foundProduct) {
                return {
                    price: foundProduct.product_price,
                    quantity: product.quantity,
                    productId: product.productId,
                    index: product.index
                };
            }
        })
    );
};

/**
 * ?a[gte]=2&b[gt]=3&c[lte]=5&d[lt]=6
 *
 * @param queryInput
 * @return {Promise<void>}
 */
const advancedSearch = async (queryInput) => {
    // const excludedFields = ["page", "sort", "size", "fields"];
    // excludedFields.forEach((el) => delete queryInput[el]);

    //1. advanced filtering
    let queryStr = JSON.stringify(queryInput);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    let filter = {};
    if (queryInput.search) {
        filter = {
            isPublished: true,
            $or: [
                {product_name: {$regex: queryInput.search, $options: "i"}},
                {product_description: {$regex: queryInput.search, $options: "i"}},
            ],
        }
    }
    console.log("queryStr", queryStr);
    let query = product.find({...queryStr, ...filter});

    //2. sorting
    if (queryInput.sort) {
        const sortBy = queryInput.sort.split(",").join(" ");
        console.log(sortBy);
        query = query.sort(sortBy);
    } else {
        query = query.sort("-createdAt");
    }

    //3. field limiting
    if (queryInput.fields) {
        const fields = queryInput.fields.split(",").join(" ");
        query = query.select(fields);
    } else {
        query = query.select("-__v");
    }

    //4. paging
    // page=0&size=10
    const page = queryInput.page * 1 || 1;
    const size = queryInput.limit * 1 || 100;
    const offset = (page - 1) * size;

    query = query.skip(offset).limit(size);

    if (queryInput.page) {
        const total = await product.countDocuments();
        if (offset >= total)
            throw new BusinessLogicError("This page does not exists");
    }

    return await query;
};
const updateProductRating = async (productId) => {
    let foundProduct = await product.findById(productId);

    if (!foundProduct) {
        throw new Api404Error('Product not found');
    }
    const commentsFound = await Comment.find({comment_product_id: productId, is_deleted: false});
    if (commentsFound.length === 0) {
        throw new Api404Error('No comments found for this product');
    }
    const totalRating = commentsFound.reduce((sum, comment) => sum + comment.comment_rating, 0);
    foundProduct.product_ratingsAverage = totalRating / commentsFound.length;
    await foundProduct.save();
    return true
};

const advancedSearchV2 = async (queryInput) => {
    const features = new ApiFeatures(product.find(), queryInput)
        .filter()
        .sort()
        .limitFields()
        .paging();

    return await features.query;
};

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    searchProductByUser,
    findAllProducts,
    findById,
    updateProductById,
    getProductById,
    checkProductByServer,
    advancedSearch,
    advancedSearchV2,
    findByIdAndDiscount,
    getProductByIdUnselect,
    findAllProductsCategory,
    draftProductByShop, updateProductRating
};
