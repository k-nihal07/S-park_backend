require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./parkingSlotModel.js');

// --- DEBUGGING LINE ---
// This will print the database URI to the console.
// If it prints "undefined", the .env file is not being loaded correctly.
console.log('Attempting to connect with URI:', process.env.MONGO_URI);
// --- END DEBUGGING LINE ---


const slotsToSeed = [
    // Add all the slots you want to create initially
    { slotId: 'P-1', location: 'CMR', status: 'Available', type: 'Standard', sensorId: 'sensor-1' },
    { slotId: 'P-2', location: 'CMR', status: 'Available', type: 'Standard', sensorId: 'sensor-2' },
    { slotId: 'EV-P1', location: 'CMR', status: 'Available', type: 'EV Charging', sensorId: 'sensor-3' },
    { slotId: 'EV-P2', location: 'CMR', status: 'Available', type: 'EV Charging', sensorId: 'sensor-4' },
    // You can add slots for other locations too

];

const seedDB = async () => {
    // A quick check to prevent running if the URI is missing
    if (!process.env.MONGO_URI) {
        console.error('ERROR: MONGO_URI is not defined. Please check your .env file.');
        return; // Stop the script
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data to avoid duplicates
        await ParkingSlot.deleteMany({});
        console.log('Existing slots cleared.');

        // Insert the new data
        await ParkingSlot.insertMany(slotsToSeed);
        console.log('Database has been seeded successfully!');

    } catch (error) {
        console.error('Error while seeding the database:', error.message);
    } finally {
        // Disconnect from the database
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the seeder function

seedDB();
