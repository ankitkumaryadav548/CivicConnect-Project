import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge, DepartmentBadge, SLABadge } from '../components/Badges';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, ListFilter, Trash2, ShieldAlert, Award, FileText, CheckCircle, Hourglass, Circle, ArrowUpRight, Users, ShieldCheck, Mail, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchIssues();
    fetchUsers();
  }, [user, navigate]);

  const fetchIssues = async () => {
    try {
      const res = await axiosInstance.get('/issues?limit=1000');
      setIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/auth/users');
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user directory');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await axiosInstance.patch(`/issues/${issueId}/status`, { status: newStatus });
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await axiosInstance.delete(`/issues/${issueId}`);
      setIssues(issues.filter(issue => issue._id !== issueId));
      toast.success('Issue deleted');
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  // Calculate stats
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    in_progress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    closed: issues.filter(i => i.status === 'closed').length,
  };

  // Category chart data
  const categoryCount = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Roads', count: categoryCount.road || 0, color: '#8b5cf6' },
    { name: 'Water', count: categoryCount.water || 0, color: '#0d9488' },
    { name: 'Electricity', count: categoryCount.electricity || 0, color: '#d97706' },
    { name: 'Sanitation', count: categoryCount.sanitation || 0, color: '#f97316' },
    { name: 'Other', count: categoryCount.other || 0, color: '#6b7280' },
  ];

  if (loading) return <div className="text-center py-20 text-slate-500 font-semibold">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
              <ShieldAlert size={16} />
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">Municipal Operations Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Admin Operations</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-1">Review public concerns, coordinate resolution pathways, and manage community reports.</p>
        </div>
      </div>

      {/* Numerical Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
        {/* Total card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Reports</span>
            <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700">
              <FileText size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{stats.total}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 uppercase tracking-wide">All reported concerns</div>
          </div>
        </div>

        {/* Open card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Open Status</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/60">
              <Circle size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{stats.open}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-2 uppercase tracking-wide">Pending assignation</div>
          </div>
        </div>

        {/* In Progress card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/60">
              <Hourglass size={16} className="animate-spin-slow" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{stats.in_progress}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2 uppercase tracking-wide">In active resolution</div>
          </div>
        </div>

        {/* Resolved card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resolved</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/60">
              <CheckCircle size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{stats.resolved}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 uppercase tracking-wide">Successfully closed</div>
          </div>
        </div>

        {/* Closed card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 border-l-4 border-l-slate-400">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Archived</span>
            <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700">
              <Award size={16} />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-none">{stats.closed}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 uppercase tracking-wide">Inactive/Closed files</div>
          </div>
        </div>
      </div>

      {/* Interactive visual analytics chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Infrastructure Burden metrics</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: 600, fill: '#94a3b8' }} />
                <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-violet-950 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-indigo-950/20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-35"></div>
          <div>
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest bg-indigo-800/40 border border-indigo-700/40 px-2.5 py-1 rounded-full inline-block mb-4">Operations Status</span>
            <h3 className="text-xl font-bold text-white leading-tight">Excellent Community Outreach</h3>
            <p className="text-indigo-200 text-xs mt-2.5 leading-relaxed">
              Ensure that new reports are acknowledged promptly (within 24 hours). Keep citizens updated with progress comments to maintain transparency.
            </p>
          </div>
          <div className="pt-6 border-t border-indigo-800/40 flex justify-between items-center text-xs font-bold text-indigo-100">
            <span>Citizen Satisfaction</span>
            <span className="flex items-center gap-0.5 text-emerald-400">94.8% <ArrowUpRight size={14} /></span>
          </div>
        </div>
      </div>

      {/* Spreadsheet / Table list container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ListFilter size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Community Concerns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Report Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">SLA Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">State Management</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {issues.map((issue) => (
                <tr key={issue._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <Link to={`/issue/${issue._id}`} className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-xs transition-colors">
                        {issue.title}
                      </Link>
                      <div className="mt-1.5 flex gap-1">
                        <CategoryBadge category={issue.category} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DepartmentBadge department={issue.department} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SLABadge slaDeadline={issue.slaDeadline} status={issue.status} priority={issue.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {issue.reportedBy?.name || 'Citizen'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                      className="block min-w-[120px] pl-2.5 pr-8 py-1 text-xs font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer border"
                    >
                      <option value="open" className="dark:bg-slate-900">🔓 Open</option>
                      <option value="in_progress" className="dark:bg-slate-900">⚙️ In Progress</option>
                      <option value="resolved" className="dark:bg-slate-900">✅ Resolved</option>
                      <option value="closed" className="dark:bg-slate-900">🔒 Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDeleteIssue(issue._id)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issues.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">🔍 No civic reports found in database log.</div>
          )}
        </div>
      </div>

      {/* User Accounts Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden mt-10 transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Registered User Accounts</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
            {users.length} Total Users
          </span>
        </div>
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">Loading user directory...</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">User Profile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Assigned Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((item) => {
                  const initials = item.name ? item.name.substring(0, 2).toUpperCase() : 'U';
                  const isAdmin = item.role === 'admin';
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${isAdmin ? 'from-amber-400 to-orange-500 shadow-amber-100' : 'from-indigo-400 to-violet-500 shadow-indigo-100'} flex items-center justify-center text-white font-extrabold text-xs shadow-sm`}>
                            {initials}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>{item.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            <ShieldCheck size={11} className="text-amber-500 dark:text-amber-400" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                            <Users size={11} className="text-violet-500 dark:text-violet-400" /> Citizen
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                          <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Active</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!usersLoading && users.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-semibold">🔍 No users registered in system directory.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
