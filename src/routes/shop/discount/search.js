const express = require('express')
const router = express.Router()
const discountController = require('../../../controllers/shop/discount.controller')
const {authenticationV2} = require("../../../auth/authUtils");

router.use(authenticationV2)

router.get('/discount-apply', discountController.getAllDiscountApply)
router.post('/amount', discountController.getDiscountAmount)
/**
 * @swagger
 *   /api/v1/discount/list-product-code:
 *     get:
 *       summary: Get discount by product
 *       tags: [Discount]
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List discount
 *           contents:
 *             application/json
 */
router.get('/list-product-code', discountController.getAllDiscountCodeWithProduct)
router.get('', discountController.getAllDiscountCodesByShop)

module.exports = router
