
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
    <p className="text-rose-700 font-serif italic text-lg">
      Weaving the next chapter of your story...
    </p>
  </div>
);

export default LoadingSpinner;
