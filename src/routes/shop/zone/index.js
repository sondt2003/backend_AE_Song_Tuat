const express = require('express')
const router = express.Router()

router.get('/', (req,res)=>{
    res.render("admin-views/zone/index.ejs");
});

module.exports = router;