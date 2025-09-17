import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import apiService from "../../services/api";
import CourseDetail from "./CourseDetail";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react";

// -------------------- Course List --------------------
const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.courses.getAll();
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    try {
      await apiService.courses.delete(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      (c.title || c.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner message="Loading courses..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Management</h1>
          <p className="text-slate-600">Manage your course catalog</p>
        </div>
        <button
          onClick={() => navigate("new")}
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Course
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600">No courses found</h3>
          <p className="text-slate-500">
            {searchTerm ? "Try a different search term" : "Create your first course to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {course.title || course.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      course.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {course.created
                      ? new Date(course.created).toLocaleDateString()
                      : "N/A"}
                  </div>
                  {course.enrollmentCount && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollmentCount} enrolled
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`${course.id}`)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => navigate(`${course.id}/edit`)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setCourseToDelete(course);
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
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Course
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{courseToDelete.title || courseToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCourseToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(courseToDelete.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------- Course Form --------------------
const CourseForm = ({ isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && id) {
      fetchCourse(id);
    }
  }, [isEditing, id]);

  const fetchCourse = async (courseId) => {
    try {
      setLoading(true);
      const course = await apiService.courses.getById(courseId);
      setFormData({
        title: course.title || course.name || "",
        description: course.description || "",
        status: course.status || "Active",
      });
    } catch (error) {
      console.error("Failed to fetch course:", error);
      alert("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic form validation
    if (!formData.title?.trim()) {
      setError("Course title is required");
      setLoading(false);
      return;
    }
    
    if (!formData.description?.trim()) {
      setError("Course description is required");
      setLoading(false);
      return;
    }

    try {
      // Prepare data with correct field names for the API
      const apiData = {
        Title: formData.title,
        Description: formData.description,
        Status: formData.status
      };
      
      let result;
      if (isEditing) {
        result = await apiService.courses.update(id, apiData);
        console.log('Course updated successfully:', result);
        setSuccess("Course updated successfully!");
      } else {
        result = await apiService.courses.create(apiData);
        console.log('Course created successfully:', result);
        setSuccess("Course created successfully!");
      }
      
      // Wait a moment to show success message, then navigate
      setTimeout(() => {
        navigate("/admin/courses", { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error("Failed to save course:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to save course. ";
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again or check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading && isEditing) return <LoadingSpinner message="Loading course..." />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEditing ? "Edit Course" : "Create New Course"}
        </h1>
        <p className="text-slate-600">
          {isEditing
            ? "Update course information"
            : "Add a new course to your catalog"}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter course description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Course"
              : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

// -------------------- Course Management Routes --------------------
const CourseManagement = () => {
  return (
    <Routes>
      <Route path="" element={<CourseList />} />
      <Route path="new" element={<CourseForm />} />
      <Route path=":id" element={<CourseDetail />} />
      <Route path=":id/edit" element={<CourseForm isEditing />} />
    </Routes>
  );
};

export default CourseManagement;
