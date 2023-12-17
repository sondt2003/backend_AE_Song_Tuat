const Comment = require('../../models/comment.model')
const {convert2ObjectId, getSelectData} = require("../../utils");
const {Api404Error, Api403Error} = require("../../core/error.response");
const {ProductService} = require("./product.service");
const {OrderService} = require("./order.service");
const {updateProductRating} = require("../../models/repositories/product.repo");
const shopModel = require("../../models/shop.model");
const RoleShop = require("../../utils/role.util");

class CommentService {
    static async createComment({userId, content, parentCommentId = null, orderId, rate, productId}) {
        await this.validateOrderExists(orderId)

        await this.validateProductExists(productId)
        let comment = new Comment({
            comment_user_id: convert2ObjectId(userId),
            comment_content: content,
            comment_rating: rate,
            comment_product_id: productId
        })
        // if (parentCommentId) {
        //     // reply comment
        //     const parentComment = await Comment.findById(parentCommentId);
        //     if (!parentComment) throw new Api404Error('Parent comment not found')
        //     rightValue = parentComment.comment_right
        //     // updateMany comments
        //     await Comment.updateMany({
        //         comment_product_id: convert2ObjectId(productId),
        //         comment_right: {$gte: rightValue}
        //     }, {
        //         $inc: {comment_right: 2}
        //     })
        //
        //     // updateMany comments
        //     await Comment.updateMany({
        //         comment_product_id: convert2ObjectId(productId),
        //         comment_left: {$gt: rightValue}
        //     }, {
        //         $inc: {comment_left: 2}
        //     })
        // } else {
        //     const maxRightValue = await Comment.findOne({
        //         comment_product_id: convert2ObjectId(productId)
        //     }, 'comment_right', {sort: {comment_right: -1}})
        //     if (maxRightValue) {
        //         rightValue = maxRightValue.comment_right + 1
        //     } else {
        //         rightValue = 1
        //     }
        // }
        // console.log('rightValue::', rightValue)
        // // insert to comment
        // comment.comment_left = rightValue
        // comment.comment_right = rightValue + 1;

        await comment.save()
        await updateProductRating(productId)
        return comment
    }

    static async getCommentByProductId({productId, limit, page}) {

        let skip = (page - 1) * limit;
        return Comment.find({comment_product_id: productId})
            .skip(skip)
            .limit(limit).sort({createdAt: -1});
    }

    static async getCommentsByParentId({productId, parentCommentId = null, limit = 50, offset = 0}) {
        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId)
            if (!parent) throw new Api404Error('Not found comment for product')

            return Comment.find({
                comment_product_id: convert2ObjectId(productId),
                comment_left: {$gt: parent.comment_left},
                comment_right: {$lte: parent.comment_right}
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parent_id: 1
            }).sort({
                comment_left: 1
            });
        }
        return Comment.find({
            comment_product_id: convert2ObjectId(productId),
            comment_parent_id: parentCommentId
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parent_id: 1
        }).sort({
            comment_left: 1
        });
    }

    static async validateProductExists(productId) {
        // check product exists in the database
        const foundProduct = await ProductService.findProductById(productId)
        if (!foundProduct) throw new Api404Error('Product not found')
    }

    static async validateOrderExists(productId, filter = {}) {
        // check product exists in the database
        const foundOrder = await OrderService.findOrderById(productId)
        if (foundOrder.order_status !== "delivered") throw new Api403Error('Order not delivered')

        if (!foundOrder) throw new Api404Error('Order not found')

        return foundOrder
    }

    static async getStatisticalCommentByForProductId(productId) {

            // Find all comments for the given product
            const comments = await Comment.find({comment_product_id: productId});

            if (!comments){
                throw new Api404Error('Comment not found')
            }
            // Initialize an object to store the count of each rating
            const ratingCount = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            };

            // Count the number of each rating
            comments.forEach((comment) => {
                const rating = comment.comment_rating;
                if (rating >= 1 && rating <= 5) {
                    ratingCount[rating]++;
                }
            });

            // Calculate the total number of ratings
            const totalRatings = comments.length;

            // Calculate the percentage distribution
            const ratingPercentage = {};
            for (let i = 1; i <= 5; i++) {
                const percentage = (ratingCount[i] / totalRatings) * 100;
                ratingPercentage[i] = percentage.toFixed(2); // Round to 2 decimal places
            }

            return ratingPercentage;



    }


    static async deleteComment({productId, commentId}) {
        await this.validateProductExists(productId)

        // detect left and right of commentId
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Api404Error('Comment not found')

        // get left, right
        const leftValue = comment.comment_left
        const rightValue = comment.comment_right

        // cal width
        const width = rightValue - leftValue + 1

        // remove all comment id children
        await Comment.deleteMany({
            comment_product_id: convert2ObjectId(productId),
            comment_left: {$gte: leftValue, $lte: rightValue}
        })

        // update value left and right
        await Comment.updateMany({
            comment_product_id: convert2ObjectId(productId),
            comment_right: {$gt: rightValue}
        }, {
            $inc: {comment_right: -width}
        })

        await Comment.updateMany({
            comment_product_id: convert2ObjectId(productId),
            comment_left: {$gt: leftValue}
        }, {
            $inc: {comment_left: -width}
        })

        return true
    }
}

module.exports = {CommentService}