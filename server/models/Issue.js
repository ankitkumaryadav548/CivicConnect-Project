const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['road', 'water', 'electricity', 'sanitation', 'other'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    images: {
      type: [String], // Array of Cloudinary URLs
      validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    upvotes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    reportedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [
      {
        status: {
          type: String,
          enum: ['open', 'in_progress', 'resolved', 'closed'],
          required: true,
        },
        comment: {
          type: String,
          required: false,
        },
        changedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 3;
}

module.exports = mongoose.model('Issue', issueSchema);
