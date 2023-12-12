const {CommentService} = require('../../services/shop/comment.service')
const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");

class CommentController {
    createComment = catchAsync(async (req, res, next) => {
        OK(res, "Create comment success", await CommentService.createComment({
            ...req.body,
            userId: req.user.userId
        }))
    });

    getCommentByProductId = catchAsync(async (req, res, next) => {
        OK(res, "Get comment by id product Success", await CommentService.getCommentByProductId({
            ...req.body,
            productId: req.params.productId
        }), {
            statistical_rate: await CommentService.getStatisticalCommentByForProductId(req.params.productId)
        })
    })


    getCommentsByParentId = catchAsync(async (req, res, next) => {
        OK(res, "Get comment success", await CommentService.getCommentsByParentId(req.query))
    });

    deleteComment = catchAsync(async (req, res, next) => {
        OK(res, "Delete comment success", await CommentService.deleteComment(req.query))
    });
}

module.exports = new CommentController()