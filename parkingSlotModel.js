// In models/parkingSlotModel.js
const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotId: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        // Make sure "Available" is in this list!
        enum: ['Available', 'Occupied', 'Booked', 'Reserved', 'Maintenance'] 
    },
    type: { // <-- Make sure this field exists
        type: String,
        required: true,
        // Example: Add the types you will use
        enum: ['Standard', 'EV Charging', 'Handicap'] 
    },
    sensorId: { // <-- Make sure this field exists
        type: String,
        required: false // Maybe it's optional? Or unique? Your choice.
    },
    // Add any other fields you have, like isOccupied
    isOccupied: {
        type: Boolean,
        default: false
    }
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
module.exports = ParkingSlot;