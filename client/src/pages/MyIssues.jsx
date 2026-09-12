import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import IssueCard from '../components/IssueCard';
import { IssueCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserCheck, FileText, ArrowLeft, ArrowUpRight } from 'lucide-react';

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyIssues();
  }, [user, navigate]);

  const fetchMyIssues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const res = await axiosInstance.get(`/issues?reportedBy=${userId}&limit=100`);
      setIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching my issues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <UserCheck size={16} />
            </span>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Citizen Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">My Civic Reports</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold mt-1">Track and monitor resolutions for community infrastructure reports you have authored.</p>
        </div>
        
        <button
          onClick={() => navigate('/report')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-indigo-950 hover:shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Report New Issue</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Grid Layout of issues */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <IssueCardSkeleton key={i} />)}
        </div>
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl">
            <FileText size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">You haven't reported any issues yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm">
            Be an active member of your municipality! Report potholes, public water leaks, or power cuts to notify officers.
          </p>
          <button
            onClick={() => navigate('/report')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            File Your First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default MyIssues;
