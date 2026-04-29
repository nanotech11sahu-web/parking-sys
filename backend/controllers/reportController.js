const Ticket = require('../models/Ticket');
const Membership = require('../models/Membership');
const ParchiType = require('../models/ParchiType');

exports.getDashboardStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const thisMonthStart = todayStr.slice(0, 7) + '-01';    // yyyy-mm-01

    const [
      totalTickets, todayTickets, monthTickets,
      totalRevenueAgg, todayRevenueAgg, monthRevenueAgg,
      recentTickets, ticketsByType,
      todayMemberships, monthMemberships,
      todayMembershipRevenueAgg, monthMembershipRevenueAgg,
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ workDate: todayStr }),
      Ticket.countDocuments({ workDate: { $gte: thisMonthStart } }),
      Ticket.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Ticket.aggregate([{ $match: { workDate: todayStr } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Ticket.aggregate([{ $match: { workDate: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Ticket.find().sort({ createdAt: -1 }).limit(10).populate('operatorId', 'name'),
      Ticket.aggregate([
        { $group: { _id: '$parchiTypeId', name: { $first: '$parchiTypeName' }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { count: -1 } }
      ]),
      Membership.countDocuments({ workDate: todayStr }),
      Membership.countDocuments({ workDate: { $gte: thisMonthStart } }),
      Membership.aggregate([{ $match: { workDate: todayStr } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Membership.aggregate([{ $match: { workDate: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    // Shift-wise today stats
    const shiftStats = await Ticket.aggregate([
      { $match: { workDate: todayStr } },
      { $group: { _id: '$shift', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    // Last 7 days (by workDate string)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const [dayTickets, dayMemberships] = await Promise.all([
        Ticket.aggregate([
          { $match: { workDate: dateStr } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]),
        Membership.aggregate([
          { $match: { workDate: dateStr } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ])
      ]);

      last7Days.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        workDate: dateStr,
        count: dayTickets[0]?.count || 0,
        revenue: (dayTickets[0]?.revenue || 0) + (dayMemberships[0]?.revenue || 0),
        membershipCount: dayMemberships[0]?.count || 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalTickets, todayTickets, monthTickets,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        todayRevenue: todayRevenueAgg[0]?.total || 0,
        monthRevenue: monthRevenueAgg[0]?.total || 0,
        todayMemberships,
        monthMemberships,
        todayMembershipRevenue: todayMembershipRevenueAgg[0]?.total || 0,
        monthMembershipRevenue: monthMembershipRevenueAgg[0]?.total || 0,
        recentTickets,
        ticketsByType,
        shiftStats,
        last7Days,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOperatorStats = async (req, res) => {
  try {
    const { startDate, endDate, shift } = req.query;
    const match = {};
    if (shift) match.shift = shift;
    if (startDate || endDate) {
      match.workDate = {};
      if (startDate) match.workDate.$gte = startDate;
      if (endDate) match.workDate.$lte = endDate;
    }

    const [ticketStats, membershipStats] = await Promise.all([
      Ticket.aggregate([
        { $match: match },
        { $group: { _id: '$operatorId', name: { $first: '$operatorName' }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { count: -1 } }
      ]),
      Membership.aggregate([
        { $match: match },
        { $group: { _id: '$operatorId', name: { $first: '$operatorName' }, membershipCount: { $sum: 1 }, membershipRevenue: { $sum: '$amount' } } },
      ])
    ]);

    const membershipMap = {};
    membershipStats.forEach(m => { membershipMap[m._id] = m; });
    const merged = ticketStats.map(t => ({
      ...t,
      membershipCount: membershipMap[t._id]?.membershipCount || 0,
      membershipRevenue: membershipMap[t._id]?.membershipRevenue || 0,
      totalRevenue: t.revenue + (membershipMap[t._id]?.membershipRevenue || 0),
    }));

    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { startDate, endDate, shift } = req.query;
    const match = {};
    if (shift) match.shift = shift;
    if (startDate || endDate) {
      match.workDate = {};
      if (startDate) match.workDate.$gte = startDate;
      if (endDate) match.workDate.$lte = endDate;
    }

    const [daily, dailyMemberships] = await Promise.all([
      Ticket.aggregate([
        { $match: match },
        { $group: {
          _id: '$workDate',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }},
        { $sort: { _id: -1 } }
      ]),
      Membership.aggregate([
        { $match: match },
        { $group: {
          _id: '$workDate',
          membershipCount: { $sum: 1 },
          membershipRevenue: { $sum: '$amount' }
        }},
        { $sort: { _id: -1 } }
      ])
    ]);

    const membershipMap = {};
    dailyMemberships.forEach(m => { membershipMap[m._id] = m; });
    const merged = daily.map(d => ({
      ...d,
      membershipCount: membershipMap[d._id]?.membershipCount || 0,
      membershipRevenue: membershipMap[d._id]?.membershipRevenue || 0,
      totalRevenue: d.revenue + (membershipMap[d._id]?.membershipRevenue || 0),
    }));

    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getShiftReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.workDate = {};
      if (startDate) match.workDate.$gte = startDate;
      if (endDate) match.workDate.$lte = endDate;
    }

    const [shiftTickets, shiftMemberships] = await Promise.all([
      Ticket.aggregate([
        { $match: match },
        { $group: {
          _id: { shift: '$shift', date: '$workDate' },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          operators: { $addToSet: '$operatorName' }
        }},
        { $sort: { '_id.date': -1, '_id.shift': 1 } }
      ]),
      Membership.aggregate([
        { $match: match },
        { $group: {
          _id: { shift: '$shift', date: '$workDate' },
          membershipCount: { $sum: 1 },
          membershipRevenue: { $sum: '$amount' }
        }}
      ])
    ]);

    const membershipMap = {};
    shiftMemberships.forEach(m => {
      const key = `${m._id.date}_${m._id.shift}`;
      membershipMap[key] = m;
    });
    const merged = shiftTickets.map(t => {
      const key = `${t._id.date}_${t._id.shift}`;
      return {
        ...t,
        membershipCount: membershipMap[key]?.membershipCount || 0,
        membershipRevenue: membershipMap[key]?.membershipRevenue || 0,
        totalRevenue: t.revenue + (membershipMap[key]?.membershipRevenue || 0),
      };
    });

    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBatchReport = async (req, res) => {
  try {
    const { startDate, endDate, operatorId, shift } = req.query;
    const match = {};
    if (shift) match.shift = shift;
    if (operatorId) match.operatorId = new (require('mongoose').Types.ObjectId)(operatorId);
    if (startDate || endDate) {
      match.workDate = {};
      if (startDate) match.workDate.$gte = startDate;
      if (endDate) match.workDate.$lte = endDate;
    }

    const batches = await Ticket.aggregate([
      { $match: match },
      { $group: {
        _id: { batchId: '$batchId', parchiTypeId: '$parchiTypeId' },
        parchiTypeName: { $first: '$parchiTypeName' },
        operatorName: { $first: '$operatorName' },
        shift: { $first: '$shift' },
        workDate: { $first: '$workDate' },
        count: { $sum: 1 },
        revenue: { $sum: '$amount' },
        fromSerial: { $min: '$serialIndex' },
        toSerial: { $max: '$serialIndex' },
        date: { $first: '$createdAt' },
      }},
      { $sort: { workDate: -1, date: -1 } }
    ]);

    res.json({ success: true, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
