import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import IssueCard from '../components/IssueCard';
import { IssueCardSkeleton } from '../components/Skeleton';
import { Search, Filter, RefreshCw, LayoutGrid, Map, ShieldCheck, UserCheck, LogIn, PlusCircle } from 'lucide-react';
import MapDashboard from '../components/MapDashboard';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filters
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const categories = ['All', 'Road', 'Water', 'Electricity', 'Sanitation', 'Other'];
  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const fetchIssues = async () => {
    setLoading(true);
    try {
      let query = `?sort=${sort}`;
      if (category !== 'All') query += `&category=${category.toLowerCase()}`;
      if (status) query += `&status=${status}`;
      if (search) query += `&search=${search}`;
      
      // If Map view is active, fetch a larger limit to display issues
      if (viewMode === 'map') {
        query += `&limit=1000`;
      } else {
        query += `&limit=20`;
      }

      const res = await axiosInstance.get(`/issues${query}`);
      setIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchIssues();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [category, status, search, sort, viewMode, user]);

  useEffect(() => {
    if (!socket) return;

    const handleIssueCreated = (newIssue) => {
      setIssues((prev) => [newIssue, ...prev]);
    };

    const handleIssueStatusUpdated = (updatedIssue) => {
      setIssues((prev) =>
        prev.map((item) => (item._id === updatedIssue._id ? updatedIssue : item))
      );
    };

    const handleIssueUpvoted = ({ issueId, upvotes }) => {
      setIssues((prev) =>
        prev.map((item) =>
          item._id === issueId ? { ...item, upvotes } : item
        )
      );
    };

    socket.on('issue:created', handleIssueCreated);
    socket.on('issue:status_updated', handleIssueStatusUpdated);
    socket.on('issue:upvoted', handleIssueUpvoted);

    return () => {
      socket.off('issue:created', handleIssueCreated);
      socket.off('issue:status_updated', handleIssueStatusUpdated);
      socket.off('issue:upvoted', handleIssueUpvoted);
    };
  }, [socket]);

  const getCategoryStyles = (cat, isActive) => {
    switch (cat.toLowerCase()) {
      case 'all':
        return isActive
          ? 'border-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
      case 'road':
        return isActive
          ? 'border-violet-600 bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-violet-400 hover:bg-violet-50/40 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
      case 'water':
        return isActive
          ? 'border-teal-600 bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
      case 'electricity':
        return isActive
          ? 'border-amber-600 bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
      case 'sanitation':
        return isActive
          ? 'border-orange-600 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-950/40 hover:text-orange-700 dark:hover:text-orange-300 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
      default:
        return isActive
          ? 'border-slate-600 bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md shadow-slate-600/20 scale-[1.04]'
          : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:bg-slate-100/40 dark:hover:bg-slate-700/40 hover:text-slate-800 dark:hover:text-slate-100 hover:shadow-sm hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]';
    }
  };

  return (
    <div className="pb-16 transition-colors duration-300">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-16 px-4 overflow-hidden border-b border-indigo-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-violet-700/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {user?.role === 'admin' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm">
              <ShieldCheck size={14} className="text-amber-400" />
              Administrator Control Portal - Viewing All Municipal Complaints
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              🏛️ Municipal Collaboration Portal
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
            {user?.role === 'admin' ? (
              <>
                Municipal Administration,<br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  Overseeing All Community Issues.
                </span>
              </>
            ) : user ? (
              <>
                Track My Reported Issues,<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-teal-300 bg-clip-text text-transparent">
                  Personal Infrastructure Dashboard.
                </span>
              </>
            ) : (
              <>
                Empower Your Community,<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-teal-300 bg-clip-text text-transparent">
                  Elevate Civic Infrastructure.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base md:text-lg">
            {user?.role === 'admin'
              ? 'Review, assign priorities, and update resolution statuses for all complaints filed by citizens across the municipality.'
              : user
              ? 'View and track resolutions for civic problems (broken roads, water leaks, power cuts) filed by you near your residence.'
              : 'Log in as a citizen to file infrastructure complaints near your home, or access as an admin to manage all municipal issues.'}
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative shadow-2xl rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl leading-5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                placeholder={user?.role === 'admin' ? "Search all municipal complaints..." : "Search your filed complaints..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Filters and Controls Bar */}
        {user?.role === 'admin' ? (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100/90 dark:border-slate-800/90 mb-8 space-y-4 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Category selection - Admin Only */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4.5 py-2 rounded-full text-xs font-extrabold border transition-all duration-300 cursor-pointer transform ${getCategoryStyles(cat, isActive)}`}
                    >
                      {cat === 'All' ? '📂 All Categories' : cat}
                    </button>
                  );
                })}
              </div>

              {/* Filtering parameters */}
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-slate-400" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value} className="dark:bg-slate-900">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="-createdAt" className="dark:bg-slate-900">Newest First</option>
                  <option value="createdAt" className="dark:bg-slate-900">Oldest First</option>
                  <option value="most_upvoted" className="dark:bg-slate-900">Most Upvoted</option>
                </select>
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-md border border-slate-100/90 dark:border-slate-800/90 mb-8 flex flex-wrap justify-between items-center gap-4 transition-colors duration-300">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              Showing Your Filed Complaints
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value} className="dark:bg-slate-900">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="-createdAt" className="dark:bg-slate-900">Newest First</option>
                <option value="createdAt" className="dark:bg-slate-900">Oldest First</option>
              </select>
            </div>
          </div>
        ) : null}

        {/* Header Section above grid */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {user?.role === 'admin'
                ? `All Community Complaints (${issues.length})`
                : user
                ? `My Reported Complaints (${issues.length})`
                : `Community Issues (${issues.length})`}
            </h3>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* View Switcher: Premium Glassmorphic Segment Control */}
              <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-slate-700/50">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Card List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-700/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Map size={14} />
                  <span>Map Dashboard</span>
                </button>
              </div>

              <button 
                onClick={fetchIssues} 
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer"
                title="Refresh Feed"
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Issues Container (List vs Map) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <IssueCardSkeleton key={i} />)}
          </div>
        ) : !user ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Please Log In to Access CivicConnect</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
              Complaints filed by citizens are protected and visible only to the citizen who filed them and municipal administrators. Log in to view your filed complaints.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={15} />
                <span>Log In</span>
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Register Citizen Account
              </button>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <MapDashboard issues={issues} />
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-3 transition-colors duration-300">
            <div className="text-3xl">📝</div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No complaints found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm">
              {user.role === 'admin'
                ? 'No municipal complaints match the selected filter criteria.'
                : 'You have not reported any complaints yet (or none match your filter parameters).'}
            </p>
            {user.role !== 'admin' && (
              <button
                onClick={() => navigate('/report')}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>File a Complaint Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
