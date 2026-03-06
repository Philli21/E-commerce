// src/components/common/SkeletonListingCard.jsx
import Skeleton from './Skeleton';

const SkeletonListingCard = () => {
  return (
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="w-full aspect-square bg-slate-200 animate-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 animate-shimmer" />
        <div className="h-6 w-1/2 bg-slate-200 animate-shimmer" />
        <div className="flex justify-between">
          <div className="h-4 w-1/3 bg-slate-200 animate-shimmer" />
          <div className="h-4 w-1/4 bg-slate-200 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonListingCard;