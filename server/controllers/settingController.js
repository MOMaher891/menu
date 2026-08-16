const Setting = require('../models/Setting');

// @desc    Get restaurant settings
// @route   GET /api/admin/settings
// @access  Private / Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    // If no settings exist, create a default one
    if (!settings) {
      settings = await Setting.create({
        restaurantName: {
          en: 'Gourmet Bistro',
          ar: 'مطعم غورميه',
        },
        logo: '',
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/admin/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { restaurantName, logo } = req.body;

    if (!restaurantName || !restaurantName.en || !restaurantName.ar) {
      return res.status(400).json({ success: false, message: 'Bilingual restaurant name (en/ar) is required' });
    }

    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create({ restaurantName, logo });
    } else {
      settings.restaurantName = restaurantName;
      settings.logo = logo;
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
