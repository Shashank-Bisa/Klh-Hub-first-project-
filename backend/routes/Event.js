const express = require('express');
const Event = require('../models/Event');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// 1. Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('registrations', 'name email'); 
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// 3. Create event (Admin/Faculty only)
router.post('/', verifyToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user.id // ID set by the verifyToken middleware
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. Register for event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    if (event.registrations.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    
    event.registrations.push(req.user.id);
    await event.save();
    
    res.json({ message: 'Successfully registered', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 5. Delete event (Admin/Faculty only)
router.delete('/:id', verifyToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;