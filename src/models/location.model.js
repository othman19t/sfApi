import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
    },
    locationId: {
      type: String,
    },
    platform: {
      type: String,
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
const Location = mongoose.model('Location', locationSchema);

export default Location;
