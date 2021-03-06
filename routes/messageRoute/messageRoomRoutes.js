// Import express for the route
const express = require("express");

// Import the Firebase authentication controller
const firebaseAuthenticationController = require(`${__dirname}/../../controller/firebaseAuthenticationController`);

// Create new router for the confession post
const router = express.Router();

// Import the messageRoomController module
const messageRoomController = require(`${__dirname}/../../controller/messageController/messageRoomController`);

// Use the protect middleware to protect any routes beyond this point
//router.use(firebaseAuthenticationController.protect);

// The route for getting all message rooms or creating the new one
router
  .route("/")
  .get(messageRoomController.getAllMessageRooms)
  .post(messageRoomController.createNewMessageRoom)
  .delete(messageRoomController.deleteChatRoom)

// The router for getting all message rooms where the specified user is in
router
  .route("/getMessageRoomOfUser")
  .get(messageRoomController.getAllMessageRoomsOfUser);

// The router for getting chat room id between the 2 specifed user od
router
  .route("/getMessageRoomIdBetween2Users")
  .get(messageRoomController.getMessageRoomIdBetween2Users);

// Export the router
module.exports = router;
