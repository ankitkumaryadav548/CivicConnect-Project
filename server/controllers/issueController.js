const mongoose = require('mongoose');
const Issue = require('../models/Issue');

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
exports.getIssues = async (req, res) => {
  try {
    const { category, status, search, reportedBy, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category.toLowerCase();
    }

    if (status) {
      query.status = status.toLowerCase();
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (reportedBy) {
      query.reportedBy = reportedBy;
    }

    // Cast reportedBy to ObjectId to support native MongoDB aggregation filters
    if (query.reportedBy && mongoose.Types.ObjectId.isValid(query.reportedBy)) {
      query.reportedBy = new mongoose.Types.ObjectId(String(query.reportedBy));
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting mapping
    let sortStr = '-createdAt';
    if (sort === 'most_upvoted') {
      sortStr = '-upvotes_count'; // We might need to handle this differently if upvotes is array, or we can aggregate
    }

    let issues;
    if (sort === 'most_upvoted') {
        issues = await Issue.aggregate([
            { $match: query },
            { $addFields: { upvoteCount: { $size: "$upvotes" } } },
            { $sort: { upvoteCount: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);
        
        // Populate after aggregation
        issues = await Issue.populate(issues, { path: 'reportedBy', select: 'name email' });
    } else {
        issues = await Issue.find(query)
          .populate('reportedBy', 'name email')
          .sort(sortStr)
          .skip(skip)
          .limit(parseInt(limit));
    }

    const total = await Issue.countDocuments(query);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: issues,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('upvotes', 'name')
      .populate('history.changedBy', 'name role');

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    req.body.reportedBy = req.user.id;
    
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => file.path);
    }

    const issue = await Issue.create(req.body);

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Make sure user is issue owner or admin
    if (issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this issue' });
    }

    issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Make sure user is issue owner or admin
    if (issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Upvote/Downvote issue
// @route   PATCH /api/issues/:id/upvote
// @access  Private
exports.toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    const upvoteIndex = issue.upvotes.indexOf(req.user.id);

    if (upvoteIndex === -1) {
      issue.upvotes.push(req.user.id);
    } else {
      issue.upvotes.splice(upvoteIndex, 1);
    }

    await issue.save();

    res.status(200).json({ success: true, data: issue.upvotes });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Change issue status
// @route   PATCH /api/issues/:id/status
// @access  Private (Admin Only)
exports.changeStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    issue.status = status;
    issue.history.push({
      status,
      comment: comment || `Status updated to ${status.replace('_', ' ')}`,
      changedBy: req.user.id,
      changedAt: new Date()
    });

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email')
      .populate('history.changedBy', 'name role')
      .populate('upvotes', 'name');

    res.status(200).json({ success: true, data: populatedIssue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get aggregated community issues analytics
// @route   GET /api/issues/analytics
// @access  Public
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Group by Category
    const categoryData = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 2. Group by Status
    const statusData = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3. Issue reports over time (last 30 days)
    const reportsOverTime = await Issue.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // 4. Category Upvote Aggregation
    const upvoteData = await Issue.aggregate([
      { $project: { category: 1, upvotesCount: { $size: "$upvotes" } } },
      { $group: { _id: "$category", totalUpvotes: { $sum: "$upvotesCount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categoryData,
        statusData,
        reportsOverTime,
        upvoteData
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
