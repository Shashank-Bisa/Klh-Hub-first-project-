const express = require('express');
const LostFound = require('../models/LostFound');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all items (with search)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const items = await LostFound.find(query).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create item
router.post('/', verifyToken, async (req, res) => {
  try {
    const item = new LostFound({
      ...req.body,
      createdBy: req.user.id
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update status (claim)
router.put('/:id/claim', verifyToken, async (req, res) => {
  try {
    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { status: 'claimed' },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
