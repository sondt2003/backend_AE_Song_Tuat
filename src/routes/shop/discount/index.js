const express = require('express')
const router = express.Router()
const discountController = require('../../../controllers/shop/discount.controller')
const {authenticationV2} = require("../../../auth/authUtils");

router.use(authenticationV2)


/**
 * 1. Generator discount code [Shop | Admin]
 * 2. Get all discount codes [User | Shop]
 * 3. Get all product by discount code [User]
 * 4. Get discount amount [User]
 * 5. Delete discount Code [Admin | Shop]
 * 6. Cancel discount Code [Code]
 */
/**
 * @swagger
 *   /api/v1/discount/amount:
 *     post:
 *       summary: Get discount amount
 *       tags: [Discount]
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: Value discount amount
 *           contents:
 *             application/json
 */


// authentication

/**
 * @swagger
 *   /api/v1/discount/:
 *     post:
 *       summary: Create discount
 *       tags: [Discount]
 *       security: []
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: Discount info
 *           contents:
 *             application/json
 */
router.post('', discountController.createDiscountCode)
/**
 * @swagger
 *   /api/v1/discount/:
 *     post:
 *       summary: Create discount
 *       tags: [Discount]
 *       security: []
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: Discount info
 *           contents:
 *             application/json
 */
/**
 * @swagger
 *   /api/v1/discount/:
 *     post:
 *       summary: Create discount
 *       tags: [Discount]
 *       security: []
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: Discount info
 *           contents:
 *             application/json
 */
router.get('/search/:keySearch', discountController.cancelDiscountCode)

module.exports = router