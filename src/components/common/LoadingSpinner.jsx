// src/components/common/LoadingSpinner.jsx
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-text-light">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;