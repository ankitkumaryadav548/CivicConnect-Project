const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Helper to determine citizen badge and tier title based on impact points
const getCitizenTier = (points = 0) => {
  if (points >= 150) {
    return { title: 'Civic Guardian', badge: '💎', color: 'from-cyan-500 to-blue-600', text: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200' };
  } else if (points >= 75) {
    return { title: 'Community Champion', badge: '🥇', color: 'from-amber-500 to-yellow-500', text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200' };
  } else if (points >= 25) {
    return { title: 'Neighborhood Watchdog', badge: '🥈', color: 'from-slate-400 to-slate-600', text: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200' };
  } else {
    return { title: 'Civic Newbie', badge: '🥉', color: 'from-amber-700 to-amber-900', text: 'text-amber-700', bg: 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-100' };
  }
};

// @desc    Get top citizen leaderboard
// @route   GET /api/leaderboard/citizens
// @access  Public
exports.getCitizenLeaderboard = async (req, res) => {
  try {
    // Aggregate issue counts and upvotes per user
    const userStats = await Issue.aggregate([
      {
        $group: {
          _id: '$reportedBy',
          totalIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
          totalUpvotes: { $sum: { $size: '$upvotes' } },
        },
      },
    ]);

    // Aggregate comment counts per user
    const commentStats = await Comment.aggregate([
      {
        $group: {
          _id: '$userId',
          totalComments: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    userStats.forEach((stat) => {
      if (stat._id) {
        statsMap[stat._id.toString()] = {
          totalIssues: stat.totalIssues,
          resolvedIssues: stat.resolvedIssues,
          totalUpvotes: stat.totalUpvotes,
          totalComments: 0,
        };
      }
    });

    commentStats.forEach((stat) => {
      if (stat._id) {
        const userIdStr = stat._id.toString();
        if (statsMap[userIdStr]) {
          statsMap[userIdStr].totalComments = stat.totalComments;
        } else {
          statsMap[userIdStr] = {
            totalIssues: 0,
            resolvedIssues: 0,
            totalUpvotes: 0,
            totalComments: stat.totalComments,
          };
        }
      }
    });

    const citizens = await User.find({ role: 'citizen' }).select('name email createdAt');

    const leaderboard = citizens.map((citizen) => {
      const stats = statsMap[citizen._id.toString()] || {
        totalIssues: 0,
        resolvedIssues: 0,
        totalUpvotes: 0,
        totalComments: 0,
      };

      // Scoring formula:
      // +10 pts per issue reported
      // +25 pts per issue resolved/closed
      // +5 pts per upvote received
      // +2 pts per comment
      const impactScore =
        stats.totalIssues * 10 +
        stats.resolvedIssues * 25 +
        stats.totalUpvotes * 5 +
        stats.totalComments * 2;

      const tier = getCitizenTier(impactScore);

      return {
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        createdAt: citizen.createdAt,
        totalIssues: stats.totalIssues,
        resolvedIssues: stats.resolvedIssues,
        totalUpvotes: stats.totalUpvotes,
        totalComments: stats.totalComments,
        impactScore,
        tier: tier.title,
        badge: tier.badge,
      };
    });

    // Sort by impact score descending
    leaderboard.sort((a, b) => b.impactScore - a.impactScore);

    // Assign rank
    const rankedLeaderboard = leaderboard.map((user, idx) => ({
      rank: idx + 1,
      ...user,
    }));

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      data: rankedLeaderboard,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get municipal department responsiveness leaderboard
// @route   GET /api/leaderboard/departments
// @access  Public
exports.getDepartmentLeaderboard = async (req, res) => {
  try {
    const departmentNames = {
      pwd_roads: '🛣️ Public Works (PWD Roads)',
      water_board: '💧 Water Supply & Drainage Board',
      electricity_board: '⚡ State Electricity Board',
      sanitation_dept: '🧹 Municipal Sanitation Dept',
      general_municipal: '🏛️ General Municipal Works',
    };

    const stats = await Issue.aggregate([
      {
        $group: {
          _id: '$department',
          totalTickets: { $sum: 1 },
          resolvedTickets: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          inProgressTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          openTickets: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
          },
          slaBreachedTickets: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'closed'] },
                    { $lt: ['$slaDeadline', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const formattedStats = Object.keys(departmentNames).map((deptKey) => {
      const found = stats.find((s) => s._id === deptKey) || {
        totalTickets: 0,
        resolvedTickets: 0,
        inProgressTickets: 0,
        openTickets: 0,
        slaBreachedTickets: 0,
      };

      const resolutionRate =
        found.totalTickets > 0
          ? Math.round((found.resolvedTickets / found.totalTickets) * 100)
          : 0;

      return {
        key: deptKey,
        name: departmentNames[deptKey],
        totalTickets: found.totalTickets,
        resolvedTickets: found.resolvedTickets,
        inProgressTickets: found.inProgressTickets,
        openTickets: found.openTickets,
        slaBreachedTickets: found.slaBreachedTickets,
        resolutionRate,
      };
    });

    // Sort by resolution rate descending
    formattedStats.sort((a, b) => b.resolutionRate - a.resolutionRate);

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user impact stats & badges
// @route   GET /api/leaderboard/my-impact
// @access  Private
exports.getMyImpact = async (req, res) => {
  try {
    const userId = req.user.id;

    const userIssues = await Issue.find({ reportedBy: userId });
    const userCommentsCount = await Comment.countDocuments({ userId });

    const totalIssues = userIssues.length;
    const resolvedIssues = userIssues.filter((i) =>
      ['resolved', 'closed'].includes(i.status)
    ).length;
    const totalUpvotes = userIssues.reduce(
      (acc, curr) => acc + (curr.upvotes ? curr.upvotes.length : 0),
      0
    );

    const impactScore =
      totalIssues * 10 +
      resolvedIssues * 25 +
      totalUpvotes * 5 +
      userCommentsCount * 2;

    // Calculate rank among all citizens
    const allCitizensRes = await exports.getCitizenLeaderboardHelper();
    const myRankItem = allCitizensRes.find((c) => c._id.toString() === userId);
    const rank = myRankItem ? myRankItem.rank : allCitizensRes.length + 1;

    const currentTier = getCitizenTier(impactScore);

    // Calculate progress to next milestone
    let nextMilestone = 25;
    if (impactScore >= 150) nextMilestone = 300;
    else if (impactScore >= 75) nextMilestone = 150;
    else if (impactScore >= 25) nextMilestone = 75;

    const progressPercentage = Math.min(
      100,
      Math.round((impactScore / nextMilestone) * 100)
    );

    // Dynamic unlocked achievement badges
    const badges = [
      {
        id: 'first_report',
        title: 'First Reporter',
        description: 'Submitted your first civic issue report',
        icon: '📢',
        unlocked: totalIssues >= 1,
      },
      {
        id: 'community_helper',
        title: 'Community Voice',
        description: 'Received 5+ upvotes from neighbors',
        icon: '👍',
        unlocked: totalUpvotes >= 5,
      },
      {
        id: 'solution_seeker',
        title: 'Solution Seeker',
        description: 'Had 1+ report resolved by municipal officers',
        icon: '✅',
        unlocked: resolvedIssues >= 1,
      },
      {
        id: 'civic_guardian',
        title: 'Civic Guardian',
        description: 'Achieved 150+ total Citizen Impact points',
        icon: '💎',
        unlocked: impactScore >= 150,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        impactScore,
        rank,
        totalIssues,
        resolvedIssues,
        totalUpvotes,
        userCommentsCount,
        tier: currentTier,
        nextMilestone,
        progressPercentage,
        badges,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Helper for rank calculations
exports.getCitizenLeaderboardHelper = async () => {
  const userStats = await Issue.aggregate([
    {
      $group: {
        _id: '$reportedBy',
        totalIssues: { $sum: 1 },
        resolvedIssues: {
          $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
        },
        totalUpvotes: { $sum: { $size: '$upvotes' } },
      },
    },
  ]);

  const statsMap = {};
  userStats.forEach((stat) => {
    if (stat._id) {
      statsMap[stat._id.toString()] = stat;
    }
  });

  const citizens = await User.find({ role: 'citizen' });

  const list = citizens.map((citizen) => {
    const stats = statsMap[citizen._id.toString()] || {
      totalIssues: 0,
      resolvedIssues: 0,
      totalUpvotes: 0,
    };
    const impactScore =
      stats.totalIssues * 10 + stats.resolvedIssues * 25 + stats.totalUpvotes * 5;
    return { _id: citizen._id, impactScore };
  });

  list.sort((a, b) => b.impactScore - a.impactScore);
  return list.map((item, idx) => ({ rank: idx + 1, ...item }));
};
