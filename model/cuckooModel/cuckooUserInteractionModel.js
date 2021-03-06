// Import the mongoose
const mongoose = require("mongoose");

// Cuckoo user interaction schema
const cuckooUserInteraction = new mongoose.Schema({
  user: {
    type: String,
    required: [true, "user id must not be blank"],
  },
  interactWith: {
    type: String,
    required: [true, "User id of the user interacting with must not be blank"],
  },
  interactionFrequency: {
    type: Number,
    required: [true, "Interaction frequency must not be blank"],
  },
});

// Cuckoo user interaction model based on the schema
const CuckooUserInteraction = mongoose.model(
  "CuckooUserInteraction",
  cuckooUserInteraction
);

// Export the user interaction model
module.exports = CuckooUserInteraction;
