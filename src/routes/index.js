const express = require('express');
const router = express.Router();

router.use('', require('./shop'));
router.use('', require('./user'));

module.exports = router;