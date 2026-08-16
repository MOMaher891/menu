const express = require('express');
const router = express.Router();
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

// All routes in this router require authentication
router.use(protect);

router.route('/')
  .get(getOffers)
  .post(createOffer);

router.route('/:id')
  .put(updateOffer)
  .delete(deleteOffer);

module.exports = router;
