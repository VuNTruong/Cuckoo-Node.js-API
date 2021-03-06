// Import the user model
const User = require(`${__dirname}/../../model/userModel/userModel`);

// Import the app error which will be used to handle errors
const AppError = require(`${__dirname}/../../utils/appError`);

// Import the handler factory
const factory = require(`${__dirname}/../handlerFactory`);

// Import this one in order to catch error in any async functions
const catchAsync = require(`${__dirname}/../../utils/catchAsync`);

// Import the cuckoo follow model
const cuckooFollowModel = require(`${__dirname}/../../model/cuckooModel/cuckooFollowModel`);

// This middleware is used to get all users
exports.getAllUsers = factory.getAllDocuments(User);

// This middleware is used for making the request.params.id equals to the id of the currently logged in user
exports.getCurrentUserId = (request, respond, next) => {
  request.params.id = request.user.id;
  next();
};

// This middleware is used to get information of the currently logged in user
exports.getMe = factory.getOneDocument(User);

// This is the middleware which will make sure that the user is not using this route to change the password
exports.validateRoute = (request, respond, next) => {
  if (request.body.password || request.body.passwordConfirm) {
    return next(new AppError("This route is not for password update", 400));
  }

  // Call the next middleware
  next();
};

// This is used for updating information of the currently logged in user
exports.updateMe = catchAsync(async (request, respond, next) => {
  // 1) Create error if user POSTs password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }

  // 2) Update user document
  // Get id of the user
  // It can be either from the request.user or from request.param
  var userId = request.query.userId;

  const updatedUser = await User.findByIdAndUpdate(userId, request.body, {
    new: true,
    runValidators: true,
  });

  // Return the respond to the client
  respond.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// This middleware is used for searching user
exports.searchUser = catchAsync(async (request, response, next) => {
  // Replace "-" with " " in search query
  let replacedSearchQuery = request.query.fullName.replace("-", " ");

  // Array of found user
  const foundUser = await User.find({
    fullName: { $regex: replacedSearchQuery },
  });

  // Return response to the client
  response.status(200).json({
    status: "success",
    data: foundUser,
  });
});

// The middleware which is used to find restaurants within a specified radius
exports.getUserWithin = catchAsync(async (request, respond, next) => {
  // Get full name search query of the user
  const fullName = request.query.fullName;

  // Get location info from the search query
  const { distance, latlong, unit } = request.query;

  // Get the lattitude and longitude from the latlong parameter
  const [lattitude, longitude] = latlong.split(",");

  // The radius should be converted to radian in this case. We get it by dividing the distance by the radius of the earth
  var radiusInRadian = 0;
  if (unit === "mi") {
    radiusInRadian = distance / 3963.2;
  } else {
    radiusInRadian = distance / 6378.1;
  }

  if (!lattitude || !longitude) {
    next(new AppError("Please provide your longitude and lattitude", 400));
  }

  // The request body
  var requestBody = {
    fullName: { $regex: fullName },
    location: {
      $geoWithin: { $centerSphere: [[longitude, lattitude], radiusInRadian] },
    },
    country: request.query.country,
    city: request.query.city,
    stateOrProvince: request.query.stateOrProvince,
    street: request.query.stateOrProvince,
    zip: request.query.zip,
  };

  // Exclude fields that are not specified in the URL
  if (!request.query.country) {
    delete requestBody.country;
  }
  if (!request.query.city) {
    delete requestBody.city;
  }
  if (!request.query.stateOrProvince) {
    delete requestBody.stateOrProvince;
  }
  if (!request.query.street) {
    delete requestBody.street;
  }
  if (!request.query.zip) {
    delete requestBody.zip;
  }

  const users = await User.find(requestBody);

  respond.status(200).json({
    status: "success",
    results: users.length,

    data: users,
  });
});

// The function to get list of user to show on the Cuckoo map for user with specified user id
exports.getListOfUsersToShowOnCuckooMapForUser = catchAsync(
  async (request, response, next) => {
    // Get user id of the user who want to get list of users to be shown on the Cuckoo map
    const userId = request.query.userId;

    // List of users to be pinned on the Cuckoo map for user
    const arrayOfUsersToBePinnedOnMap = [];

    // Reference the database to get list of followings of user with specified user id
    const listOfFollowingsOfUser = await cuckooFollowModel.find({
      follower: userId,
    });

    // Loop through that list of followings to check and see if that user also follow
    // user with specified user id or not
    for (let i = 0; i < listOfFollowingsOfUser.length; i++) {
      // Reference the database to check and see if that user also follow user
      // with specified user id or not
      const followObjectBetween2Users = await cuckooFollowModel.findOne({
        follower: listOfFollowingsOfUser[0].following,
        following: userId,
      });

      // If follow object between the 2 users is not null, it means that user with specified user id
      // is followed by current user in the loop
      // if that's the case, add that user id to the array of 2 ways follow
      if (followObjectBetween2Users != null) {
        // Reference the database to check and see if this user enable location share or not
        const userObject = await User.findOne({
          _id: followObjectBetween2Users.follower,
          locationEnabled: "Enabled",
        });

        // If the user object is not null (user does turn on location), add that user id to the list
        if (userObject != null) {
          arrayOfUsersToBePinnedOnMap.push(followObjectBetween2Users.follower);
        }
      }
    }

    // Return response to the client
    response.status(200).json({
      status: "Done",
      data: arrayOfUsersToBePinnedOnMap,
    });
  }
);
