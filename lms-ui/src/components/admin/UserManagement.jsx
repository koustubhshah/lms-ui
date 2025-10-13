import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Lock, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

// Placeholder components for sub-routes
const UserList = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">All Users</h2>
      <Link 
        to="/admin/users/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New User
      </Link>
    </div>
    
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
            placeholder="Search users..."
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            User list will be displayed here. This is a placeholder component.
          </p>
          <div className="mt-4">
            <Link 
              to="/admin/pending-requests" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Pending Requests <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserManagement = () => {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};

// Create a wrapper component for the user management routes
const UserManagementRoutes = () => {
  return (
    <Routes>
      <Route index element={<UserList />} />
      <Route path="new" element={<div className="p-6">New User Form (Placeholder)</div>} />
      <Route path="pending-requests" element={<PendingRequests />} />
      <Route path="roles" element={<div className="p-6">Roles Management (Placeholder)</div>} />
      <Route path="permissions" element={<div className="p-6">Permissions Management (Placeholder)</div>} />
    </Routes>
  );
};

export { UserManagement, UserManagementRoutes };

export default UserManagement;
