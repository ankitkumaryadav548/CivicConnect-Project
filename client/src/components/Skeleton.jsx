import React from 'react';

export const IssueCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="h-5 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};
