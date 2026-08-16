const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

// All routes in this router require authentication
router.use(protect);

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
