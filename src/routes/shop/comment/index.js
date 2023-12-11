const express = require('express')
const router = express.Router()
const commentController = require('../../../controllers/shop/comment.controller')
const {authenticationV2} = require("../../../auth/authUtils");


router.get('/:productId', commentController.getCommentByProductId)

// start authentication //
router.use(authenticationV2)
// end authentication //

router.post('', commentController.createComment)
router.get('', commentController.getCommentsByParentId)
router.delete('', commentController.deleteComment)

module.exports = router