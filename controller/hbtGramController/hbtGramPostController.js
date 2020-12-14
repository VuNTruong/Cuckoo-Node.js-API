const { request, response } = require("express");

// Import the hbt gram post model
const hbtGramPostModel = require(`${__dirname}/../../model/hbtGramModel/hbtGramPostModel`);

// Import the hbt gram follow model
const hbtGramFollowModel = require(`${__dirname}/../../model/hbtGramModel/hbtGramFollowModel`);

// Import the HBTGram post comment model
const hbtGramPostCommentModel = require(`${__dirname}/../../model/hbtGramModel/hbtGramPostCommentModel`);

// Import the HBTGram post like model
const hbtGramPostLikeModel = require(`${__dirname}/../../model/hbtGramModel/hbtGramPostLikeModel`);

// Import the HBTGram post photo model
const hbtGramPostPhotoModel = require(`${__dirname}/../../model/hbtGramModel/hbtGramPostPhotoModel`);

// Import the handler factory
const factory = require(`${__dirname}/../handlerFactory`);

// Import catchAsync
const catchAsync = require(`${__dirname}/../../utils/catchAsync`);

// The function to get all hbt gram posts
exports.getAllHBTGramPosts = factory.getAllDocuments(hbtGramPostModel);

// The function to get all hbt gram posts for the user
exports.getAllHBTGramPostsForUser = catchAsync(async (request, response, next) => {
  // Get user id of the user to get posts for
  const userId = request.query.userId

  // Array of posts for the user (will be added when post for user is found)
  const arrayOfPostsForUser = []
  
  // Reference the database to get HBT Gram posts (later, we will just take a portion)
  const allPosts = await hbtGramPostModel.find()

  // For each of posts in the array, check to see if the specified user follow writer of the post or not
  for (i = 0; i < allPosts.length; i++) {
    // Get user id of the post writer
    const postWriterUserId = allPosts[i].writer

    // Reference the database to check and see if the specified user follows the post writer or not
    const followObject = await hbtGramFollowModel.findOne({
      follower: userId,
      following: postWriterUserId
    })

    // If the followObject between the 2 users is not null, add the post object to the array of posts for user
    if (followObject != null) {
      arrayOfPostsForUser.push(allPosts[i])
    }
  }

  // Return response to the client app
  response.status(200).json({
    status: "Done",
    results: arrayOfPostsForUser.length,
    data: arrayOfPostsForUser
  })
})

// The function to get HBTGram post detail
// This will include post info, URLs of images, number of likes and comments and array of comments
exports.getHBTGramPostDetail = catchAsync(async (request, response, next) => {
  // Reference the database to get info of the post
  const postInfo = await hbtGramPostModel.findOne({
    _id: request.query.postId,
  });

  // Reference the database to get number of comments of the post
  const arrayOfComments = await hbtGramPostCommentModel.find({
    postId: request.query.postId,
  });
  const numOfComments = arrayOfComments.length;

  // Reference the database to get number of likes of the post
  const arrayOfLikes = await hbtGramPostLikeModel.find({
    postId: request.query.postId,
  });
  const numOfLikes = arrayOfLikes.length;

  // Reference the database to get array of images of the post
  const arrayOfImages = await hbtGramPostPhotoModel.find({
    postId: request.query.postId,
  });

  // Return response to the client app
  response.status(200).json({
    postInfo: postInfo,
    arrayOfImages: arrayOfImages,
    numOfComments: numOfComments,
    numOfLikes: numOfLikes,
    arrayOfComments: arrayOfComments,
  });

  // Go to the next middleware
  next();
});

// The function to create new hbt gram post
exports.createNewHBTGramPost = factory.createDocument(hbtGramPostModel);

// The function to delete a hbt gram post
exports.deleteHBTGramPost = factory.deleteOne(hbtGramPostModel);
