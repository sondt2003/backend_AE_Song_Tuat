const express = require('express')
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router()

// health check application
router.use('/healthcheck', require('./health'))
router.get('/api/mongodb/ota_res_user_config/sync2mongodb', (req, res) => {
    let id = req.params.id;
    let data = req.params.data;
    console.log("id", id);
    console.log("data", data);
    res.send({
        status: true,
        data: {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
            }
        },
        msg: ""
    })
})
router.post('/api/mongodb/ota_res_user_config/sync2mongodb', (req, res) => {
    let id = req.params.id;
    let data = req.params.data;
    console.log("id", id);
    console.log("data", data);
    res.send({
        status: true,
        data: {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
            }
        },
        msg: ""
    })
})
router.put('/api/mongodb/ota_res_user_config/sync2mongodb', (req, res) => {
    let id = req.params.id;
    let data = req.params.data;
    console.log("id", id);
    console.log("data", data);
    res.send({
        status: true,
        data: {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
            }
        },
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