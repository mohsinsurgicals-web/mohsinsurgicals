import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="relative p-4 bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
        <div className="w-3/4 h-3/4 bg-gray-200 rounded-lg"></div>
        
        {/* Badges Skeleton */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Vendor Skeleton */}
        <div className="w-20 h-3 bg-gray-200 rounded mb-2"></div>
        
        {/* Title Skeleton */}
        <div className="w-full h-5 bg-gray-200 rounded mb-2"></div>
        <div className="w-2/3 h-5 bg-gray-200 rounded mb-4"></div>
        
        {/* Rating Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>

        {/* Specs Skeleton */}
        <div className="w-24 h-4 bg-gray-200 rounded mb-4"></div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="w-12 h-3 bg-gray-200 rounded"></div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
          
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
