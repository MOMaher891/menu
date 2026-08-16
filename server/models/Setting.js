const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    restaurantName: {
      en: {
        type: String,
        required: [true, 'Restaurant name in English is required'],
        default: 'Gourmet Bistro',
      },
      ar: {
        type: String,
        required: [true, 'Restaurant name in Arabic is required'],
        default: 'مطعم غورميه',
      },
    },
    logo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
