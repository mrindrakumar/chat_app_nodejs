const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const socketApi = require('./sockets/index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Connect to the database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socketApi(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
