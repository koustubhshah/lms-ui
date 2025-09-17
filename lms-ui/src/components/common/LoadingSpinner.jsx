import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 ${sizeClasses[size]}`}
      ></div>
      {message && (
        <p className="text-slate-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;