const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'Category English name is required'],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, 'Category Arabic name is required'],
        trim: true,
      },
    },
    icon: {
      type: String,
      default: 'Utensils', // Fallback default icon slug
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
