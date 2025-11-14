const express = require('express');
const router = express.Router();
const User = require('./userModel.js');
const ParkingSlot = require('./parkingSlotModel.js');
const bcrypt = require('bcryptjs');

// --- User Routes (These are correct) ---

// POST /api/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, plate } = req.body;
        if (!email || !password || !name || !plate) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            email, 
            password: hashedPassword,
            name,
            vehicle: { plate } 
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup.', error: error.message });
    }
});

// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        res.status(200).json({ 
            message: 'Login successful.', 
            user: { 
                email: user.email, 
                name: user.name, 
                vehicle: user.vehicle,
                memberSince: user.memberSince 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});


// --- Frontend Data Route (This is correct) ---
router.get('/parking-data', async (req, res) => {
    try {
        const slots = await ParkingSlot.find({});
        const slotsByLocation = {};
        slots.forEach(slot => {
            if (!slotsByLocation[slot.location]) slotsByLocation[slot.location] = [];
            slotsByLocation[slot.location].push(slot);
        });
        const locations = Object.keys(slotsByLocation).map(locName => ({
            name: locName,
            image: `images/${locName.toLowerCase().replace(/ /g, '_')}.jpeg` 
        }));
        res.status(200).json({ locations, parkingSlots: slotsByLocation });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching parking data.', error: error.message });
    }
});

// --- Hardware Route - Updated to avoid full-document validation errors ---
router.post('/sensor/update', async (req, res) => {
  const { slotId, isOccupied } = req.body;
  const io = req.app.get('socketio');

  try {
    const newStatus = isOccupied ? 'Occupied' : 'Available';

    // Update only the fields we need to change to avoid re-validating the whole document
    const updatedSlot = await ParkingSlot.findOneAndUpdate(
      { slotId },
      { $set: { isOccupied: !!isOccupied, status: newStatus } },
      { new: true } // return the updated document
    ).lean();

    if (!updatedSlot) {
      console.warn(`[FAIL] Hardware update for unknown slotId: ${slotId}`);
      return res.status(404).json({ message: 'Slot ID not found in database.' });
    }

    console.log(`Hardware Update: Slot ${updatedSlot.slotId} is now ${newStatus}`);

    // Emit a minimal update payload for the frontend (avoid sending whole Mongoose internals)
    if (io) {
      io.emit('slotUpdated', {
        _id: updatedSlot._id,
        slotId: updatedSlot.slotId,
        location: updatedSlot.location,
        status: updatedSlot.status,
        isOccupied: updatedSlot.isOccupied
      });
    }

    res.status(200).json({ message: 'Slot status updated successfully', updatedSlot });
  } catch (error) {
    console.error('❌ [CRITICAL] Error in sensor update route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;



