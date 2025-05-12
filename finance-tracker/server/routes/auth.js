const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const User = require('../models/Users'); // Import the User model

const router = express.Router(); // Create a new router instance


router.post('/signup', async (req, res ) => {
    try {
        const { email, password } = req.body; // Destructure email and password from request body
        
        const hash = await bcrypt.hash(password, 10); // Hash the password before saving to the database
        const newUser = new User({ email,  password: hash }); // Create a new user instance with hashed password
        await newUser.save(); // Save the new user to the database
        res.status(201).json({ message: 'User created successfully' }); // Respond with success message
    } catch(error) {
        res.status(500).json({ message: 'Error creating user Email may already exist or something went wrong' }); // Respond with error message
    }

});