import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Award,
  TrendingUp,
  Clock,
  Plus,
  Eye
} from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all 
      const [courses, enrollments, certificates] = await Promise.all([
        apiService.courses.getAll(),
        apiService.enrollments.getAll(),
        apiService.certificates.getAll(),
      ]);

      setStats({
        totalUsers: enrollments.length > 0 ? new Set(enrollments.map(e => e.userId)).size : 0,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalCertificates: certificates.length,
      });

      
      setRecentActivity(enrollments.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, linkTo }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color === 'bg-blue-500' ? 'bg-slate-900' : color === 'bg-green-500' ? 'bg-gray-800' : color === 'bg-purple-500' ? 'bg-gray-700' : 'bg-gray-600'}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {linkTo && (
        <Link 
          to={linkTo}
          className="mt-4 inline-flex items-center text-sm font-semibold text-slate-900 hover:text-gray-700 border-b border-slate-900 hover:border-gray-700 transition-colors"
        >
          View Details <Eye className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, linkTo, color }) => (
    <Link 
      to={linkTo}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${color === 'bg-green-500' ? 'bg-slate-900' : color === 'bg-blue-500' ? 'bg-gray-800' : 'bg-gray-700'}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of your learning management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          color="bg-blue-500"
          linkTo="/admin/users"
        />
        <StatCard
          icon={BookOpen}
          title="Total Courses"
          value={stats.totalCourses}
          color="bg-green-500"
          linkTo="/admin/courses"
        />
        <StatCard
          icon={GraduationCap}
          title="Active Enrollments"
          value={stats.totalEnrollments}
          color="bg-purple-500"
          linkTo="/admin/enrollments"
        />
        <StatCard
          icon={Award}
          title="Certificates Issued"
          value={stats.totalCertificates}
          color="bg-orange-500"
          linkTo="/admin/certificates"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={Plus}
            title="Create New Course"
            description="Add a new course to your catalog"
            linkTo="/admin/courses/new"
            color="bg-green-500"
          />
          <QuickAction
            icon={Users}
            title="Manage Users"
            description="View and manage user accounts"
            linkTo="/admin/users"
            color="bg-blue-500"
          />
          <QuickAction
            icon={TrendingUp}
            title="View Results"
            description="Check student performance and results"
            linkTo="/admin/results"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Enrollments</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No recent activity to display
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        New enrollment in Course {activity.courseId}
                      </p>
                      <p className="text-sm text-slate-600">
                        User ID: {activity.userId}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(activity.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;