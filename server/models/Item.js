const mongoose = require('mongoose');

const ChoiceSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  priceModifier: {
    type: Number,
    default: 0,
  },
});

const OptionSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ['radio', 'checkbox'],
    default: 'radio',
  },
  required: {
    type: Boolean,
    default: false,
  },
  choices: [ChoiceSchema],
});

const ItemSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'Item English name is required'],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, 'Item Arabic name is required'],
        trim: true,
      },
    },
    description: {
      en: {
        type: String,
        default: '',
        trim: true,
      },
      ar: {
        type: String,
        default: '',
        trim: true,
      },
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item must belong to a category'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    options: [OptionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema);
