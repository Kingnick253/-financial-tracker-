const mongoose = require('mongoose');
                                                                  // Import mongoose for MongoDB interaction
                                                                  // Define the user schema — this sets the structure for user documents in MongoDB
const userSchema = new mongoose.Schema({

  email: {
    type:"String",
    required: true,                                               // Email is required
    unique: true,                                                 // Email must be unique
  },
  password:{
    type:"String",
    required: true,                                               // Password is required
  },
});

module.exports = mongoose.model("User", userSchema);              // Export the User model based on the schema
                                                                  // This model will be used to interact with the users collection in the MongoDB database