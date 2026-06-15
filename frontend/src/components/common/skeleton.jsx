export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="skeleton h-6 w-1/3" />
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-5/6" />
    <div className="skeleton h-10 w-1/4" />
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="glass-card p-6 space-y-3">
    <div className="skeleton h-4 w-1/2" />
    <div className="skeleton h-8 w-1/3" />
  </div>
);

export const SkeletonChart = () => (
  <div className="glass-card p-6">
    <div className="skeleton h-6 w-1/3 mb-4" />
    <div className="skeleton h-64 w-full" />
  </div>
);