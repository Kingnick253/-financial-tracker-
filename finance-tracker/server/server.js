require('dotenv').config();                                                 // Load environment variables from .env file

const express = require('express');                                         // Import express framework
const mongoose = require('mongoose');                                       // Import mongoose for MongoDB interaction
const cors = require('cors');                                               // Import cors for Cross-Origin Resource Sharing
const authRoutes = require('./routes/auth');                                // Import authentication routes

const app = express();                                                      // Create an instance of express

// Middleware
app.use(cors());                                                            // Enable CORS for all routes
app.use(express.json());                                                    // Parse incoming JSON requests

app.use('/api/auth', authRoutes);                                           // Any route starting with /api/auth will Use authentication routes


mongoose.connect(process.env.MONGO_URI)                                     // Connect to MongoDB using the URI from environment variables
  .then(() => app.listen(5000, () => console.log('Server running on port 5000')))
  .catch((err) => console.log(err));