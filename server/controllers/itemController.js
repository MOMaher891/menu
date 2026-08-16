const Item = require('../models/Item');
const Category = require('../models/Category');
const Offer = require('../models/Offer');

// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('categoryId', 'name icon');
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/admin/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isAvailable, options } = req.body;

    if (!name || !name.en || !name.ar) {
      return res.status(400).json({ success: false, message: 'Bilingual name (en/ar) is required' });
    }

    if (!price || price < 0) {
      return res.status(400).json({ success: false, message: 'Price is required and must be non-negative' });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category ID is required' });
    }

    // Verify category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const item = await Item.create({
      name,
      description,
      price,
      image,
      categoryId,
      isAvailable,
      options: options || [],
    });

    const populatedItem = await Item.findById(item._id).populate('categoryId', 'name icon');

    res.status(201).json({ success: true, data: populatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/admin/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isAvailable, options } = req.body;

    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        image,
        categoryId,
        isAvailable,
        options: options || [],
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name icon');

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an item and its offers
// @route   DELETE /api/admin/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Delete item
    await item.deleteOne();

    // Delete associated offers
    await Offer.deleteMany({ itemId: req.params.id });

    res.json({ success: true, message: 'Item and associated promotions deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};
