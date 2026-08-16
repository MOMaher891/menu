const Category = require('../models/Category');
const Item = require('../models/Item');

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ orderIndex: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, icon, orderIndex, isActive } = req.body;

    if (!name || !name.en || !name.ar) {
      return res.status(400).json({ success: false, message: 'Bilingual name (en/ar) is required' });
    }

    const category = await Category.create({
      name,
      icon,
      orderIndex,
      isActive,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(550).json({ success: false, message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, icon, orderIndex, isActive } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, orderIndex, isActive },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category & optionally its items
// @route   DELETE /api/admin/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete category
    await category.deleteOne();

    // Delete associated items
    await Item.deleteMany({ categoryId: req.params.id });

    res.json({ success: true, message: 'Category and all associated items deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
