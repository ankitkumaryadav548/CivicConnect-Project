const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Issue',
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Please add text for the comment'],
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
