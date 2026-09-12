const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const { broadcastEvent, emitToUser } = require('../config/socket');
const { sendStatusUpdateEmail } = require('../config/mailer');

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
// @desc    Get all issues
// @route   GET /api/issues
// @access  Public (Citizen sees own issues only, Admin sees all complaints)
exports.getIssues = async (req, res) => {
  try {
    const { category, status, search, reportedBy, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    // Role-based separation:
    // 1. If user is logged in as 'citizen' (non-admin), ONLY fetch issues reported by that specific user.
    // 2. If user is logged in as 'admin', fetch all complaints across all users.
    // 3. If user is NOT logged in (guest), filter out all reports so complaints remain private.
    if (reportedBy && mongoose.Types.ObjectId.isValid(reportedBy)) {
      query.reportedBy = new mongoose.Types.ObjectId(String(reportedBy));
    }

    if (category && category !== 'All') {
      query.category = category.toLowerCase();
    }

    if (status) {
      query.status = status.toLowerCase();
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting mapping
    let sortStr = '-createdAt';
    if (sort === 'most_upvoted') {
      sortStr = '-upvotes_count';
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
// @access  Public (Citizen sees own issue, Admin sees all)
exports.getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('upvotes', 'name')
      .populate('history.changedBy', 'name role');

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Role separation check: If citizen user is logged in, verify ownership
    if (req.user && req.user.role !== 'admin') {
      const isOwner = issue.reportedBy && (
        issue.reportedBy._id ? issue.reportedBy._id.toString() === req.user.id : issue.reportedBy.toString() === req.user.id
      );
      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'Not authorized to view complaints reported by other citizens' });
      }
    } else if (!req.user) {
      return res.status(401).json({ success: false, error: 'Please log in to view issue details' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const calculateSLADeadline = (priority = 'medium') => {
  const now = new Date();
  switch (priority.toLowerCase()) {
    case 'urgent':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case 'high':
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    case 'medium':
      return new Date(now.getTime() + 120 * 60 * 60 * 1000); // 5 days
    case 'low':
      return new Date(now.getTime() + 168 * 60 * 60 * 1000); // 7 days
    default:
      return new Date(now.getTime() + 120 * 60 * 60 * 1000);
  }
};

const getAutoDepartment = (category) => {
  switch (category?.toLowerCase()) {
    case 'water':
      return 'water_board';
    case 'road':
      return 'pwd_roads';
    case 'electricity':
      return 'electricity_board';
    case 'sanitation':
      return 'sanitation_dept';
    default:
      return 'general_municipal';
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

    if (req.body.latitude !== undefined && req.body.latitude !== '' && !isNaN(Number(req.body.latitude))) {
      req.body.latitude = Number(req.body.latitude);
    } else {
      delete req.body.latitude;
    }

    if (req.body.longitude !== undefined && req.body.longitude !== '' && !isNaN(Number(req.body.longitude))) {
      req.body.longitude = Number(req.body.longitude);
    } else {
      delete req.body.longitude;
    }

    if (!req.body.department) {
      req.body.department = getAutoDepartment(req.body.category);
    }

    if (!req.body.slaDeadline) {
      req.body.slaDeadline = calculateSLADeadline(req.body.priority || 'medium');
    }

    const issue = await Issue.create(req.body);
    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name email');

    broadcastEvent('issue:created', populatedIssue);

    res.status(201).json({ success: true, data: populatedIssue });
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

    if (req.body.priority && req.body.priority !== issue.priority) {
      req.body.slaDeadline = calculateSLADeadline(req.body.priority);
    }

    issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('reportedBy', 'name email').populate('history.changedBy', 'name role');

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

    broadcastEvent('issue:upvoted', { issueId: issue._id, upvotes: issue.upvotes });

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

    // Broadcast status update event
    broadcastEvent('issue:status_updated', populatedIssue);

    // Create in-app notification & send email
    if (populatedIssue.reportedBy) {
      const recipientId = populatedIssue.reportedBy._id
        ? populatedIssue.reportedBy._id.toString()
        : populatedIssue.reportedBy.toString();

      if (recipientId !== req.user.id) {
        const notification = await Notification.create({
          recipient: recipientId,
          sender: req.user.id,
          issue: populatedIssue._id,
          type: 'status_change',
          title: 'Issue Status Updated',
          message: `Status of "${populatedIssue.title}" changed to ${status.replace('_', ' ').toUpperCase()}`,
        });

        emitToUser(recipientId, 'notification:new', notification);

        if (populatedIssue.reportedBy.email) {
          sendStatusUpdateEmail({
            recipientEmail: populatedIssue.reportedBy.email,
            recipientName: populatedIssue.reportedBy.name,
            issueTitle: populatedIssue.title,
            issueId: populatedIssue._id,
            newStatus: status,
            comment,
          });
        }
      }
    }

    res.status(200).json({ success: true, data: populatedIssue });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Citizen verification of resolved issue (Confirm or Reopen)
// @route   PATCH /api/issues/:id/citizen-verify
// @access  Private (Reporting Citizen Only)
exports.citizenVerifyIssue = async (req, res) => {
  try {
    const { decision, comment } = req.body; // decision: 'confirm' or 'reject'
    
    if (!['confirm', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be confirm or reject' });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Verify logged-in user is the citizen reporter of this issue
    const isOwner = issue.reportedBy.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only the citizen who reported this issue can verify or reopen it' });
    }

    if (decision === 'confirm') {
      issue.status = 'closed';
      issue.history.push({
        status: 'closed',
        comment: comment || 'Citizen confirmed issue resolution.',
        changedBy: req.user.id,
        changedAt: new Date()
      });
    } else if (decision === 'reject') {
      issue.status = 'in_progress';
      issue.history.push({
        status: 'in_progress',
        comment: comment || 'Citizen reported issue is NOT resolved. Reopened for municipal action.',
        changedBy: req.user.id,
        changedAt: new Date()
      });
    }

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
