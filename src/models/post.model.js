import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
    },
    postUrl: {
      type: String,
      required: true,
    },
    status: {
      // ignore its
      type: String,
      // required: true,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    distance: {
      type: String,
    },
    imgSrc: [
      {
        type: String,
      },
    ],
    price: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Replace 'User' with whatever your user model is named
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Taskr', // Replace 'User' with whatever your user model is named
    },
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    scrollTime: {
      type: Number,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt timestamps
  }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
