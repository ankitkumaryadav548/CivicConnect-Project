import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageSquare, Clock, User } from 'lucide-react';
import { StatusBadge, CategoryBadge } from './Badges';

const IssueCard = ({ issue }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full">
      {/* Visual Image Header */}
      <div className="h-48 relative overflow-hidden bg-slate-100">
        {issue.images && issue.images.length > 0 ? (
          <img 
            src={issue.images[0]} 
            alt={issue.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 gap-2">
            <span className="text-3xl">🏛️</span>
            <span className="text-xs font-semibold">Civic Improvement</span>
          </div>
        )}
        
        {/* Floating Category and Status Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/issue/${issue._id}`} className="block group/title mb-2.5">
          <h3 className="text-base font-bold text-slate-800 leading-snug group-hover/title:text-indigo-600 transition-colors line-clamp-2">
            {issue.title}
          </h3>
        </Link>

        {/* Issue location metadata */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-indigo-500" />
            <span className="truncate max-w-[130px]" title={issue.location}>{issue.location}</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            <span>{timeAgo(issue.createdAt)}</span>
          </span>
        </div>

        {/* Card Footer controls */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
              <ThumbsUp size={13} className={issue.upvotes?.length > 0 ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400'} />
              <span>{issue.upvotes?.length || 0}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
              <MessageSquare size={13} className="text-slate-400" />
              <span>Discuss</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
              <User size={10} className="text-indigo-600" />
            </div>
            <span className="truncate max-w-[100px]">{issue.reportedBy?.name || 'Citizen'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
