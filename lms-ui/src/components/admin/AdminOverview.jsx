import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Eye,
  ArrowRight,
  BarChart2,
  UserPlus,
  Bookmark,
  CheckCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

// Glass card component
const GlassCard = ({ children, className = '' }) => (
  <div className={`backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 shadow-xl shadow-black/5 dark:shadow-black/20 ${className}`}>
    {children}
  </div>
);

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

  const StatCard = ({ icon: Icon, title, value, color, linkTo }) => {
    // Define color variants with modern gradients
    const colorVariants = {
      'bg-blue-500': {
        bg: 'from-blue-500/5 to-blue-600/5',
        icon: 'from-blue-500 to-blue-600',
        text: 'text-blue-600',
        hover: 'hover:from-blue-500/10 hover:to-blue-600/10'
      },
      'bg-green-500': {
        bg: 'from-emerald-500/5 to-teal-500/5',
        icon: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-600',
        hover: 'hover:from-emerald-500/10 hover:to-teal-500/10'
      },
      'bg-purple-500': {
        bg: 'from-violet-500/5 to-fuchsia-500/5',
        icon: 'from-violet-500 to-fuchsia-500',
        text: 'text-violet-600',
        hover: 'hover:from-violet-500/10 hover:to-fuchsia-500/10'
      },
      'bg-orange-500': {
        bg: 'from-amber-500/5 to-orange-500/5',
        icon: 'from-amber-400 to-orange-500',
        text: 'text-amber-600',
        hover: 'hover:from-amber-500/10 hover:to-orange-500/10'
      }
    };

    const colors = colorVariants[color] || {
      bg: 'from-gray-500/5 to-gray-600/5',
      icon: 'from-gray-500 to-gray-600',
      text: 'text-gray-600',
      hover: 'hover:from-gray-500/10 hover:to-gray-600/10'
    };
    
    return (
      <motion.div 
        variants={item}
        className={`relative overflow-hidden group`}
      >
        <GlassCard className={`p-6 transition-all duration-500 ${colors.hover}`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
                <p className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colors.icon} mb-4`}>
                  {value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.icon} shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {linkTo && (
              <Link 
                to={linkTo}
                className={`mt-4 inline-flex items-center text-sm font-medium ${colors.text} group-hover:opacity-90 transition-opacity`}
              >
                View Insights
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}
            
            {/* Animated background elements */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
                 style={{ background: `radial-gradient(circle, currentColor 0%, transparent 70%)` }} />
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const QuickAction = ({ icon: Icon, title, description, linkTo, color }) => {
    // Define color variants with modern gradients and hover effects
    const colorVariants = {
      'bg-green-500': {
        gradient: 'from-emerald-400 to-teal-500',
        light: 'from-emerald-50/70 to-teal-50/70',
        hover: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      'bg-blue-500': {
        gradient: 'from-blue-400 to-indigo-500',
        light: 'from-blue-50/70 to-indigo-50/70',
        hover: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400'
      },
      'bg-purple-500': {
        gradient: 'from-purple-400 to-fuchsia-500',
        light: 'from-purple-50/70 to-fuchsia-50/70',
        hover: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400'
      },
      'bg-orange-500': {
        gradient: 'from-amber-400 to-orange-500',
        light: 'from-amber-50/70 to-orange-50/70',
        hover: 'hover:shadow-amber-100 dark:hover:shadow-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400'
      }
    };

    const colors = colorVariants[color] || {
      gradient: 'from-gray-400 to-gray-500',
      light: 'from-gray-50/70 to-gray-100/70',
      hover: 'hover:shadow-gray-100 dark:hover:shadow-gray-800/30',
      text: 'text-gray-600 dark:text-gray-400'
    };
    
    return (
      <motion.div variants={item} className="h-full">
        <Link 
          to={linkTo}
          className={`group block h-full relative overflow-hidden rounded-2xl p-px transition-all duration-500 ${colors.hover} hover:shadow-lg`}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
               style={{ background: `linear-gradient(135deg, ${colors.gradient.replace('from-', '').replace('to-', '')})` }} />
          
          <GlassCard className={`h-full bg-gradient-to-br ${colors.light} dark:bg-gray-800/50 group-hover:backdrop-blur-sm transition-all duration-500`}>
            <div className="relative z-10 p-5">
              <div className="flex items-start space-x-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg flex-shrink-0`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform duration-200">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </div>
              
              <div className={`mt-4 inline-flex items-center text-sm font-medium ${colors.text} group-hover:opacity-90 transition-all duration-200`}>
                Get started
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
                   style={{ background: `radial-gradient(circle, currentColor 0%, transparent 70%)` }} />
            </div>
          </GlassCard>
        </Link>
      </motion.div>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header with animated gradient text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Welcome back! 
        </p>
      </motion.div>

      {/* Stats Grid with staggered animations */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
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
          title="Certificates"
          value={stats.totalCertificates}
          color="bg-orange-500"
          linkTo="/admin/certificates"
        />
      </motion.div>

      {/* Quick Actions with glass effect */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors">
            View all features
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <QuickAction
            icon={Plus}
            title="Create New Course"
            description="Add a new course to your catalog"
            linkTo="/admin/courses/new"
            color="bg-green-500"
          />
          <QuickAction
            icon={UserPlus}
            title="Manage Users"
            description="View and manage user accounts"
            linkTo="/admin/users"
            color="bg-blue-500"
          />
          <QuickAction
            icon={BarChart2}
            title="View Analytics"
            description="Check platform performance metrics"
            linkTo="/admin/analytics"
            color="bg-purple-500"
          />
        </div>
      </motion.div>

      {/* Recent Activity with glass effect */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors">
            View all activity
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <GlassCard className="overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 mb-4">
                <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">New enrollments will appear here</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <Link to={`/admin/enrollments/${activity.id}`} className="block p-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              New enrollment in Course {activity.courseId}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              User ID: <span className="font-mono text-gray-700 dark:text-gray-300">{activity.userId}</span>
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50 transition-colors">
                            {new Date(activity.enrollmentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AdminOverview;