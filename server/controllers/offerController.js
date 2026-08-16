const Offer = require('../models/Offer');
const Item = require('../models/Item');

// @desc    Get all offers
// @route   GET /api/admin/offers
// @access  Private
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('itemId', 'name price image');
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an offer
// @route   POST /api/admin/offers
// @access  Private
const createOffer = async (req, res) => {
  try {
    const { title, discountPercentage, discountedPrice, itemId, startDate, endDate, isActive } = req.body;

    if (!title || !title.en || !title.ar) {
      return res.status(400).json({ success: false, message: 'Bilingual title (en/ar) is required' });
    }

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date' });
    }

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    // Calculate discountedPrice if discountPercentage is provided and vice-versa
    let calculatedDiscountedPrice = discountedPrice;
    if (discountPercentage && discountPercentage > 0 && !discountedPrice) {
      calculatedDiscountedPrice = parseFloat((item.price * (1 - discountPercentage / 100)).toFixed(2));
    }

    const offer = await Offer.create({
      title,
      discountPercentage: discountPercentage || 0,
      discountedPrice: calculatedDiscountedPrice,
      itemId,
      startDate: start,
      endDate: end,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedOffer = await Offer.findById(offer._id).populate('itemId', 'name price image');

    res.status(201).json({ success: true, data: populatedOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an offer
// @route   PUT /api/admin/offers/:id
// @access  Private
const updateOffer = async (req, res) => {
  try {
    const { title, discountPercentage, discountedPrice, itemId, startDate, endDate, isActive } = req.body;

    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    let item;
    if (itemId) {
      item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
    } else {
      item = await Item.findById(offer.itemId);
    }

    let start = startDate ? new Date(startDate) : offer.startDate;
    let end = endDate ? new Date(endDate) : offer.endDate;

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    let calculatedDiscountedPrice = discountedPrice;
    if (discountPercentage !== undefined && !discountedPrice && item) {
      calculatedDiscountedPrice = parseFloat((item.price * (1 - discountPercentage / 100)).toFixed(2));
    }

    offer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        title,
        discountPercentage: discountPercentage !== undefined ? discountPercentage : offer.discountPercentage,
        discountedPrice: calculatedDiscountedPrice !== undefined ? calculatedDiscountedPrice : offer.discountedPrice,
        itemId: itemId || offer.itemId,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? isActive : offer.isActive,
      },
      { new: true, runValidators: true }
    ).populate('itemId', 'name price image');

    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/admin/offers/:id
// @access  Private
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    await offer.deleteOne();

    res.json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
