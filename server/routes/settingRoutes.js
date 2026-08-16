const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getSettings)
  .put(protect, updateSettings);

module.exports = router;
