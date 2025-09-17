import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import ModuleForm from './forms/ModuleForm';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  FileText,
  BookOpen,
  Calendar,
} from 'lucide-react';

// Module List Component
const ModuleList = () => {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesData, coursesData] = await Promise.all([
        apiService.modules.getAll(),
        apiService.courses.getAll()
      ]);
      setModules(modulesData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (moduleId) => {
    try {
      await apiService.modules.delete(moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      setShowDeleteModal(false);
      setModuleToDelete(null);
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert('Failed to delete module');
    }
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || course?.name || `Course ${courseId}`;
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || module.courseId === parseInt(selectedCourse);
    return matchesSearch && matchesCourse;
  });

  if (loading) return <LoadingSpinner message="Loading modules..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Modules Management</h1>
          <p className="text-gray-600">Manage course modules and content</p>
        </div>
        <button
          onClick={() => setShowModuleForm(true)}
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Module
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title || course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No modules found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCourse ? 'Try adjusting your filters' : 'Create your first module to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {module.title}
                  </h3>
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {module.description}
                </p>

                <div className="text-sm text-gray-500 mb-4">
                  <p className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Course: {getCourseTitle(module.courseId)}
                  </p>
                  {module.created && (
                    <p className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(module.created).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingModule(module);
                      setShowModuleForm(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setModuleToDelete(module);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && moduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Module
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{moduleToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setModuleToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(moduleToDelete.id)}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <ModuleForm
          courseId={editingModule?.courseId}
          module={editingModule}
          isEditing={!!editingModule}
          onClose={() => {
            setShowModuleForm(false);
            setEditingModule(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowModuleForm(false);
            setEditingModule(null);
          }}
        />
      )}
    </div>
  );
};

// Module Management Routes
const ModulesManagement = () => {
  return (
    <Routes>
      <Route path="" element={<ModuleList />} />
    </Routes>
  );
};

export default ModulesManagement;