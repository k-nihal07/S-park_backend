require('dotenv').config();
const express = require('express');
const http = require('http'); // Import the built-in http module
const { Server } = require("socket.io"); // Import Socket.IO
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create an HTTP server from the Express app
const server = http.createServer(app); 

// Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"]
  }
});

// Make the 'io' object accessible to our API routes
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('✅ A user connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('❌ User disconnected from WebSocket');
  });
});

const apiRoutes = require('./api.js');
app.use('/api', apiRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
// Start the server using the http server instance
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

