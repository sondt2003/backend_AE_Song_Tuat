const express = require('express')
const router = express.Router()
const productController = require('../../../controllers/shop/product.controller')
const {authenticationV2} = require("../../../auth/authUtils");



// authentication
router.use(authenticationV2)


/**
 * @swagger
 *   /api/v1/product/publish/{id}:
 *     put:
 *       summary: Update publish product
 *       tags: [Product]
 *       parameters:
 *         - in: path
 *           name: id
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
 *           description: Product info after update
 *           contents:
 *             application/json
 */
router.put('/publish/:id', productController.publishProductByShop)
router.put('/draft/:id', productController.draftProductByShop)

// query
/**
 * @swagger
 *   /api/v1/product/drafts/all:
 *     post:
 *       summary: Search product drafts by key
 *       tags: [Product]
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List product draft contains key search
 *           contents:
 *             application/json
 */
router.get('/drafts/all', productController.getAllDraftsForShop)
/**
 * @swagger
 *   /api/v1/product/published/all:
 *     post:
 *       summary: Search product published by key
 *       tags: [Product]
 *       responses:
 *         "400":
 *           $ref: '#/components/responses/400'
 *         "401":
 *           $ref: '#/components/responses/401'
 *         "200":
 *           description: List product publish contains key search
 *           contents:
 *             application/json
 */
router.get('/published/all', productController.getAllPublishedForShop)

// router
module.exports = router