// Require mongoose package
const mongoose = require("mongoose");

// Create schema for the Cuckoo post photo label
const cuckooPostPhotoLabelSchema = new mongoose.Schema({
  imageID: {
    type: String,
    required: [true, "image id must not be blank"],
  },
  imageLabel: {
    type: String,
    required: [true, "image label must not be blank"],
  },
  orderInCollection: {
    type: Number,
  },
});

// Run this middleware before saving new document to the database in order to get order
// in collection for the newly created object
cuckooPostPhotoLabelSchema.pre("save", async function (next) {
  // The date object
  let dateObject = new Date();

  // OBTAIN THE ORDER IN COLLECTION
  // Get number of seconds since 1970
  let numOfSeconds = Math.floor(dateObject / 1000);

  // Set the order in collection property of the object to be the number of seconds we
  // just got
  this.orderInCollection = numOfSeconds;

  // Go to the next middlware
  next();
});

// Create the object out of the schema
const CuckooPostPhotoLabel = mongoose.model(
  "CuckooPostPhotoLabel",
  cuckooPostPhotoLabelSchema
);

// Export the model
module.exports = CuckooPostPhotoLabel;
