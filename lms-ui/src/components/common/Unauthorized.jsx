import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 text-lg">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="space-x-4">
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-block px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;