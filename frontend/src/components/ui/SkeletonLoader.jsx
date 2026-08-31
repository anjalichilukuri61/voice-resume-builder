import React from 'react';

export const SkeletonLine = ({ className = "h-4 w-full" }) => {
  return (
    <div className={`bg-gray-200 animate-pulse rounded-full ${className}`}></div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full space-y-4">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 h-12 w-12 rounded-full animate-pulse"></div>
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-4">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-4/6" />
      </div>
    </div>
  );
};
