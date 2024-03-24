import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // 'User' should match the name you gave to your user model
      required: true,
    },
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // 'Post' should match the name you gave to your post model
      required: true,
    },
    schedule: {
      type: String, //TODO: should update this field after i figure out how to handle this in cron job and user input
    },
    tags: {
      type: [String],
    },
    blockedKeyWords: {
      type: [String],
    },
    radius: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt timestamps
  }
);

// Then create a Model from it
const Task = mongoose.model('Task', taskSchema);

export default Task;
