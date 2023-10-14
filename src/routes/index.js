const express = require('express')
const {apiKey, permission} = require("../auth/checkAuth");
const router = express.Router()

// health check application
router.use('/healthcheck', require('./health'))
router.get('/api/mongodb/ota_res_user_config/sync2mongodb', (req,res)=>{
    let id = req.params.id;
    let data = req.params.data;
    console.log("id",id);
    console.log("data",data);
    res.send({
        status: true,
        data: null,
        msg: ""
    })
})

router.use('/zone', require('./zone'))

// check apiKey
router.use(apiKey)

// check permission
router.use(permission('0000'))

// init routes
router.use('/api/v1/cart', require('./cart'))
router.use('/api/v1/order', require('./order'))
router.use('/api/v1/discount', require('./discount'))
router.use('/api/v1/product', require('./product'))
router.use('/api/v1/comment', require('./comment'))
router.use('/api/v1/auth', require('./auth'))

module.exports = router