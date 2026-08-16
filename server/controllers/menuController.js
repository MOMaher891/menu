const Category = require('../models/Category');
const Item = require('../models/Item');
const Offer = require('../models/Offer');
const Setting = require('../models/Setting');

// @desc    Get public menu (categories and items with active discounts computed)
// @route   GET /api/menu
// @access  Public
const getPublicMenu = async (req, res) => {
  try {
    const { table } = req.query;
    
    // Log table access if table number is provided
    if (table) {
      console.log(`Table ${table} accessed the menu.`);
    }

    // Fetch restaurant settings
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        restaurantName: {
          en: 'Gourmet Bistro',
          ar: 'مطعم غورميه',
        },
        logo: '',
      });
    }

    // Fetch active categories
    const categories = await Category.find({ isActive: true }).sort({ orderIndex: 1 });

    // Fetch available items
    const items = await Item.find({ isAvailable: true });

    // Fetch active offers
    const now = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    // Map active offers by itemId for fast lookup
    const offersMap = {};
    activeOffers.forEach((offer) => {
      offersMap[offer.itemId.toString()] = offer;
    });

    // Process items and attach computed discount info
    const processedItems = items.map((item) => {
      const itemObj = item.toObject();
      const activeOffer = offersMap[item._id.toString()];

      if (activeOffer) {
        let promoPrice = activeOffer.discountedPrice;
        if (!promoPrice && activeOffer.discountPercentage > 0) {
          promoPrice = parseFloat((item.price * (1 - activeOffer.discountPercentage / 100)).toFixed(2));
        }

        itemObj.offer = {
          title: activeOffer.title,
          originalPrice: item.price,
          discountedPrice: promoPrice || item.price,
          discountPercentage: activeOffer.discountPercentage,
          endDate: activeOffer.endDate,
          badge: {
            en: 'SPECIAL OFFER',
            ar: 'عرض خاص',
          },
        };
      } else {
        itemObj.offer = null;
      }

      return itemObj;
    });

    res.json({
      success: true,
      table: table || null,
      settings,
      categories,
      items: processedItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicMenu,
};
