const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    title: {
      en: {
        type: String,
        required: [true, 'Offer English title is required'],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, 'Offer Arabic title is required'],
        trim: true,
      },
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
      default: 0,
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Offer must be linked to an item'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date and time is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', OfferSchema);
