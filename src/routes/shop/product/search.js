const express = require('express')
const router = express.Router()
const productController = require('../../../controllers/shop/product.controller')


router.get('/all/:shopId', productController.getAllPublished)

/**
 * @swagger
 *   /api/v1/product/search/{keySearch}:
 *     get:
 *       summary: Search product by key
 *       tags: [Product]
 *       security: []
 *       parameters:
 *         - in: path
 *           name: keySearch
 *           schema:
 *             type: string
 *           required: true
 *           description: key word search product
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List product contains key search
 *           contents:
 *             application/json
 */
router.get('/search/:keySearch', productController.searchProducts)

const aliasSearch = (req, res, next) => {
    req.query.page = '1'
    req.query.limit = '5'
    req.query.sort = '-name'
    req.query.fields = 'product_name , product_price ,image '
    next()
}


router.get('/advanced-search', productController.advancedSearch)

/**
 * @swagger
 *   /api/v1/product/:
 *     get:
 *       summary: Search product by key
 *       tags: [Product]
 *       security: []
 *       parameters:
 *         - in: path
 *           name: keySearch
 *           schema:
 *             type: string
 *           required: true
 *           description: key word search product
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List product contains key search
 *           contents:
 *             application/json
 */
router.get('/', productController.findAllProducts)
/**
 * @swagger
 *   /api/v1/product/{product_id}:
 *     get:
 *       summary: Search one product by product_id
 *       tags: [Product]
 *       security: []
 *       parameters:
 *         - in: path
 *           name: keySearch
 *           schema:
 *             type: string
 *           required: true
 *           description: key word search product
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List product contains key search
 *           contents:
 *             application/json
 */
router.get('/:product_id', productController.findProduct)
module.exports = router
