const express = require('express')
const router = express.Router()
const favoriteController = require('../../../controllers/shop/favorite.controller')
const {authenticationV2} = require("../../../auth/authUtils");



router.use(authenticationV2)
router.get('', favoriteController.getListUserFavorite)
router.get('/:favoriteId', favoriteController.getUserFavoriteDetails)
router.post('', favoriteController.createUserFavorite)
router.put('/:favoriteId', favoriteController.updateUserFavorite)
router.delete('/:favoriteId', favoriteController.deleteFavorite)

module.exports = router
