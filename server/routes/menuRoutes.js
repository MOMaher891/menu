const express = require('express');
const router = express.Router();
const { getPublicMenu } = require('../controllers/menuController');

router.get('/', getPublicMenu);

module.exports = router;
