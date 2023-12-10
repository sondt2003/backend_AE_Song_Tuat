const catchAsync = require('../../helpers/catch.async')
const {OK} = require("../../core/success.response");
const {CartService} = require("../../services/shop/cart.service");

/**
 * - Add product to cart - user
 * - Reduce product quantity by one - user
 * - increase product quantity by one - user
 * - get cart - user
 * - delete cart - user
 * - delete cart item - user
 */
class CartController {

    /**
     * @desc Add to cart for user
     *
     * @type {function(*, *, *): void}
     * @method POST
     * @url /api/v1/cart
     * @return {}
     */
    addToCart = catchAsync( async(req, res) => {
        OK(res,  "Add to cart success", await CartService.addToCart({userId: req.user.userId,...req.body}))
    })

    /**
     * @desc Update to cart for user
     *
     * @type {function(*, *, *): void}
     * @method PUT
     * @url /api/v1/cart
     * @return {}
     */
    update = catchAsync( async(req, res) => {
        OK(res,  "Update to cart success", await CartService.addToCartV2({userId: req.user.userId,...req.body}))
    })

    /**
     * @desc Delete item in cart for user
     *
     * @type {function(*, *, *): void}
     * @method DELETE
     * @url /api/v1/cart
     * @return {}
     */
    delete = catchAsync( async(req, res) => {
        OK(res,  "Delete cart success", await CartService.deleteIndexInCart({userId: req.user.userId,...req.params}))
    })

    /**
     * @desc Get cart for user
     *
     * @type {function(*, *, *): void}
     * @method GET
     * @url /api/v1/cart
     * @return {}
     */
    listToCart = catchAsync( async(req, res) => {
        OK(res,  "List cart success", await CartService.getListUserCart({userId: req.user.userId}))
    })
}

module.exports = new CartController()