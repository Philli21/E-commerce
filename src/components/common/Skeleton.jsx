// src/components/common/Skeleton.jsx
const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-slate-200 ${className}`} />;
};

export default Skeleton;