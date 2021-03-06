// Import the CuckooFollowModel
const cuckooFollowModel = require(`${__dirname}/../../model/cuckooModel/cuckooFollowModel`);

// Import the handler factory
const factory = require(`${__dirname}/../handlerFactory`);

// Import the catchAsync
const catchAsync = require(`${__dirname}/../../utils/catchAsync`);

// THe function to get all follows
exports.getAllCuckooFollows = factory.getAllDocuments(cuckooFollowModel);

// The function to create new follow
exports.createNewCuckooFollow = factory.createDocument(cuckooFollowModel);

// The function to deleta a follow
exports.deleteCuckooFollow = factory.deleteOne(cuckooFollowModel);

// The function to delete a follow between the 2 specified users
exports.deleteCuckooFollowBetween2Users = catchAsync(
  async (request, response, next) => {
    // Get follower
    const follower = request.query.follower;

    // Get following
    const following = request.query.following;

    // Execute the command to remove a follow
    await cuckooFollowModel.deleteOne({
      follower: follower,
      following: following,
    });

    // Return response to the client app
    response.status(204).json({
      status: "Done",
    });
  }
);

// The function to get list of two way follow of user with specified user id
exports.getListOf2WayFollowOfUser = catchAsync(
  async (request, response, next) => {
    // Get user id of the user to get two way follow
    const userId = request.query.userId;

    // List of 2 way follow of user with specified user id
    const arrayOf2WayFollow = [];

    // Reference the database to get list of followings of user with specified user id
    const listOfFollowingsOfUser = await cuckooFollowModel.find({
      follower: userId,
    });

    console.log(listOfFollowingsOfUser)

    // Loop through that list of followings to check and see if that user also follow
    // user with specified user id or not
    for (let i = 0; i < listOfFollowingsOfUser.length; i++) {
      // Reference the database to check and see if that user also follow user
      // with specified user id or not
      const followObjectBetween2Users = await cuckooFollowModel.findOne({
        follower: listOfFollowingsOfUser[i].following,
        following: userId,
      });

      // If follow object between the 2 users is not null, it means that user with specified user id
      // is followed by current user in the loop
      // if that's the case, add that user id to the array of 2 ways follow
      if (followObjectBetween2Users != null) {
        arrayOf2WayFollow.push(followObjectBetween2Users.follower);
      }
    }

    // Return response with list of 2 ways follow to the user
    response.status(200).json({
      status: "Done",
      data: arrayOf2WayFollow,
    });
  }
);

// The function to check if the specified user is following the specified user or not
exports.checkFollowStatus = catchAsync(async (request, response, next) => {
  // Get user id of the follower
  const follower = request.query.follower;

  // Get user id of the user being followed
  const following = request.query.following;

  // Reference the database to see if the follower is following the specified user or not
  const followObject = await cuckooFollowModel.findOne({
    follower: follower,
    following: following,
  });

  // If the follow object is found, it means that the specified user is following the other specified user
  if (followObject != null) {
    // Return response to the client app
    response.status(200).json({
      status: "Done",
      data: "Yes",
    });
  } // Otherwise, the specified user is not following the other specified user
  else {
    // Return response to the client app
    response.status(200).json({
      status: "Done",
      data: "No",
    });
  }
});
