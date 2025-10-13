import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  GraduationCap, 
  Award,
  TrendingUp,
  Clock,
  Play,
  CheckCircle,
  Plus
} from 'lucide-react';
import TraineeCourseDetail from './TraineeCourseDetail';

const TraineeOverview = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  const progressSummaryKey = (userId, courseId) => `lms_progress_summary_${userId}_${courseId}`;
  const getProgressSummary = (courseId) => {
    try {
      const raw = localStorage.getItem(progressSummaryKey(user?.id, courseId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchTraineeData();
  }, []);

  const fetchTraineeData = async () => {
    try {
      setLoading(true);
      const [courses, allCourses, certs] = await Promise.all([
        apiService.enrollments.getAll(),
        apiService.courses.getAll(),
        apiService.certificates.getByUser(user.id)
      ]);
      setLoadError('');
      setEnrolledCourses(courses);
      setAvailableCourses(allCourses.filter(course => 
        !courses.some(enrollment => enrollment.courseId === course.id)
      ));
      setCertificates(certs);
    } catch (error) {
      console.error('Failed to fetch trainee data:', error);
      setLoadError(error.message || 'Unable to load your enrollments due to permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiService.enrollments.enroll({
        userId: user.id,
        courseId: courseId,
        enrollmentDate: new Date().toISOString()
      });
      fetchTraineeData(); // Refresh data
    } catch (error) {
      console.error('Failed to enroll:', error);
      const msg = (error.message || '').toLowerCase().includes('403')
        ? 'You do not have permission to enroll yourself in this course. Please contact an administrator.'
        : 'Failed to enroll in course';
      alert(msg);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-slate-600">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Enrolled Courses</p>
              <p className="text-3xl font-bold text-slate-900">{enrolledCourses.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Certificates</p>
              <p className="text-3xl font-bold text-slate-900">{certificates.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Available Courses</p>
              <p className="text-3xl font-bold text-slate-900">{availableCourses.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">My Courses</h2>
        {loadError && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
            {loadError}
          </div>
        )}
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No enrolled courses yet</h3>
            <p className="text-slate-500">Browse available courses below to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">Course {enrollment.courseId}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {enrollment.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                </p>
                {/* Progress bar */}
                {(() => { const s = getProgressSummary(enrollment.courseId); return (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{s?.percent ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s?.percent ?? 0}%` }} />
                    </div>
                    {s && (
                      <div className="text-xs text-slate-500 mt-1">{s.modulesCompleted}/{s.modulesTotal} modules</div>
                    )}
                  </div>
                ); })()}
                <button onClick={() => navigate(`/trainee/courses/${enrollment.courseId}`)} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Courses</h2>
        {availableCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">All courses enrolled!</h3>
            <p className="text-slate-500">You're enrolled in all available courses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.slice(0, 6).map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{course.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {course.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {course.description}
                </p>
                
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder trainee components
const TraineeCourses = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">My Courses</h1>
    <div className="mt-8 p-8 bg-blue-50 rounded-xl">
      <p className="text-blue-700">Detailed course view will be implemented here</p>
    </div>
  </div>
);

const TraineeBrowse = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Browse Courses</h1>
    <div className="mt-8 p-8 bg-green-50 rounded-xl">
      <p className="text-green-700">Course catalog browsing will be implemented here</p>
    </div>
  </div>
);

const TraineeAssignments = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">My Assignments</h1>
    <div className="mt-8 p-8 bg-purple-50 rounded-xl">
      <p className="text-purple-700">Assignment interface will be implemented here</p>
    </div>
  </div>
);

const TraineeProgress = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">My Progress</h1>
    <div className="mt-8 p-8 bg-orange-50 rounded-xl">
      <p className="text-orange-700">Progress tracking will be implemented here</p>
    </div>
  </div>
);

const TraineeCertificates = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">My Certificates</h1>
    <div className="mt-8 p-8 bg-yellow-50 rounded-xl">
      <p className="text-yellow-700">Certificate viewing will be implemented here</p>
    </div>
  </div>
);

const TraineeProfile = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">My Profile</h1>
    <div className="mt-8 p-8 bg-indigo-50 rounded-xl">
      <p className="text-indigo-700">Profile management will be implemented here</p>
    </div>
  </div>
);

const TraineeDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<TraineeOverview />} />
        <Route path="/courses" element={<TraineeCourses />} />
        <Route path="/courses/:courseId" element={<TraineeCourseDetail />} />
        <Route path="/browse" element={<TraineeBrowse />} />
        <Route path="/assignments" element={<TraineeAssignments />} />
        <Route path="/progress" element={<TraineeProgress />} />
        <Route path="/progress/certificates" element={<TraineeCertificates />} />
        <Route path="/certificates" element={<TraineeCertificates />} />
        <Route path="/profile" element={<TraineeProfile />} />
        <Route path="/" element={<TraineeOverview />} />
      </Routes>
    </Layout>
  );
};

export default TraineeDashboard;