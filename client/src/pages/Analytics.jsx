import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Users, PieChart as PieIcon, Award, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const categoryColorMap = {
    road: '#8b5cf6',       // Violet
    water: '#14b8a6',      // Teal
    electricity: '#f59e0b',// Amber
    sanitation: '#f97316', // Orange
    other: '#64748b',      // Slate
  };

  const statusColorMap = {
    open: '#3b82f6',       // Blue
    in_progress: '#f59e0b',// Amber
    resolved: '#10b981',   // Emerald
    closed: '#ef4444',     // Red
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/issues/analytics');
        setAnalyticsData(res.data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold text-sm">Aggregating community metrics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-rose-500 font-bold">Failed to load analytics data. Please try again later.</p>
      </div>
    );
  }

  // Formatting data for Charts
  const categoryChartData = (analyticsData.categoryData || []).map(item => ({
    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
    value: item.count,
    rawCategory: item._id
  }));

  const statusChartData = (analyticsData.statusData || []).map(item => ({
    name: item._id ? item._id.replace('_', ' ').toUpperCase() : 'Unknown',
    Issues: item.count,
    rawStatus: item._id
  }));

  const timelineChartData = (analyticsData.reportsOverTime || []).map(item => ({
    date: new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Reports: item.count
  }));

  const upvotesChartData = (analyticsData.upvoteData || []).map(item => ({
    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
    Upvotes: item.totalUpvotes,
    rawCategory: item._id
  }));

  // Aggregated widget totals
  const totalIssues = (analyticsData.categoryData || []).reduce((acc, curr) => acc + curr.count, 0);
  const resolvedCount = (analyticsData.statusData || []).find(item => item._id === 'resolved')?.count || 0;
  const closedCount = (analyticsData.statusData || []).find(item => item._id === 'closed')?.count || 0;
  const activeCount = totalIssues - (resolvedCount + closedCount);
  const totalUpvotes = (analyticsData.upvoteData || []).reduce((acc, curr) => acc + curr.totalUpvotes, 0);

  return (
    <div className="pb-16 bg-slate-50/50">
      {/* Premium Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-14 px-4 overflow-hidden border-b border-indigo-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-700/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
            📊 Public Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Civic <span className="bg-gradient-to-r from-indigo-400 to-teal-300 bg-clip-text text-transparent">Analytics Dashboard</span>
          </h1>
          <p className="max-w-2xl text-slate-300 text-sm md:text-base">
            Track live resolution rates, upvote weightage, and infrastructure reporting trends transparently within our municipality grid.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total issues card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-black text-slate-800">{totalIssues}</h3>
            </div>
          </div>

          {/* Active issues card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Issues</p>
              <h3 className="text-2xl font-black text-slate-800">{activeCount}</h3>
            </div>
          </div>

          {/* Resolved issues card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved & Closed</p>
              <h3 className="text-2xl font-black text-slate-800">{resolvedCount + closedCount}</h3>
            </div>
          </div>

          {/* Total upvotes card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Community Upvotes</p>
              <h3 className="text-2xl font-black text-slate-800">{totalUpvotes}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Categories Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <PieIcon size={16} className="text-indigo-500" /> Issues by Category
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">Visual split of reported civic infrastructure complaints.</p>
            </div>
            <div className="h-[280px] w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColorMap[entry.rawCategory] || '#4f46e5'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No category data recorded.</div>
              )}
            </div>
          </div>

          {/* Issue Resolution status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle size={16} className="text-indigo-500" /> Resolution Funnel
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">Track active versus resolved and closed issue counts.</p>
            </div>
            <div className="h-[280px] w-full">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="Issues" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColorMap[entry.rawStatus] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No status data recorded.</div>
              )}
            </div>
          </div>

          {/* Reporting timeline over time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl lg:col-span-2">
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <TrendingUp size={16} className="text-indigo-500" /> Daily Reporting Density
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">Slight variations of daily issue creation over the past 30 days.</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              {timelineChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineChartData}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="Reports" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">No chronological timeline recorded yet.</div>
              )}
            </div>
          </div>

          {/* Upvote Intensity by category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl lg:col-span-2">
            <div className="mb-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users size={16} className="text-indigo-500" /> Community Upvote Support by Category
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">Which infrastructure categories do citizens upvote and care about the most?</p>
            </div>
            <div className="h-[280px] w-full">
              {upvotesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={upvotesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="Upvotes" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {upvotesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColorMap[entry.rawCategory] || '#4f46e5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">No community upvote logs.</div>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 text-indigo-700 text-sm font-extrabold rounded-xl transition-all duration-200 shadow-sm"
          >
            📂 Return to Main Grid
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
