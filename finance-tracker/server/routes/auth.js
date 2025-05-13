const express = require('express');
const bcrypt = require('bcryptjs');                                                                                 // Import bcrypt for password hashing
const jwt = require('jsonwebtoken');                                                                                // Import jsonwebtoken for token generation
const User = require('../models/Users');                                                                            // Import the User model

const router = express.Router();                                                                                    // Create a new router instance


router.post('/signup', async (req, res ) => {
    try {
        const { email, password } = req.body;                                                                       // Destructure email and password from request body
        
        const hash = await bcrypt.hash(password, 10);                                                               // Hash the password before saving to the database
        const newUser = new User({ email,  password: hash });                                                       // Create a new user instance with hashed password
        await newUser.save(); // Save the new user to the database
        res.status(201).json({ message: 'User created successfully' });                                             // Respond with success message
    } catch(error) {
        res.status(500).json({ message: 'Error creating user Email may already exist or something went wrong' });   // Respond with error message
    }

});

router.post ('/login', async (req, res) => {
    try {
        const { email, password } = req.body;                                                                       // Destructure email and password from request body
        const user = await User.findOne({ email });                                                                 // Find user by email in the database

        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });                                              // Respond with error if user not found
        }

        const isMatch = await bcrypt.compare(password, user.password);                                              // Compare provided password with hashed password in database

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });                                           // Respond with error if passwords do not match
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });                      // Generate JWT token
        res.status(200).json({ token });                                                                            // Respond with the generated token
    } catch (error) {
        res.status(500).json({ message: 'Error Failed to login' });                                                 // Respond with error message
    }
});

module.exports = router;                                                                                            // Export the router for use in other parts of the application