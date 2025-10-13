import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import ModuleForm from './forms/ModuleForm';
import AssignmentForm from './forms/AssignmentForm';
import QuestionForm from './forms/QuestionForm';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  FileCheck,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Target
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData] = await Promise.all([
        apiService.courses.getById(id),
        apiService.modules.getByCourse(id)
      ]);

      setCourse(courseData);
      setModules(modulesData);

      // Fetch assignments for each module
      const assignmentsData = {};
      const questionsData = {};

      for (const module of modulesData) {
        try {
          const moduleAssignments = await apiService.assignments.getByModule(module.id);
          assignmentsData[module.id] = moduleAssignments;

          // Fetch questions for each assignment
          for (const assignment of moduleAssignments) {
            try {
              const assignmentQuestions = await apiService.questions.getByAssignment(assignment.id);
              questionsData[assignment.id] = assignmentQuestions;
            } catch (error) {
              console.warn(`Failed to fetch questions for assignment ${assignment.id}:`, error);
              questionsData[assignment.id] = [];
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch assignments for module ${module.id}:`, error);
          assignmentsData[module.id] = [];
        }
      }

      setAssignments(assignmentsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAssignment = (assignmentId) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleAddModule = () => {
    setSelectedModule(null);
    setShowModuleForm(true);
  };

  const handleAddAssignment = (moduleId) => {
    setSelectedModule({ id: moduleId });
    setSelectedAssignment(null);
    setShowAssignmentForm(true);
  };

  const handleAddQuestion = (assignmentId, moduleId) => {
    setSelectedAssignment({ id: assignmentId, moduleId });
    setShowQuestionForm(true);
  };

  if (loading) return <LoadingSpinner message="Loading course details..." />;
  if (!course) return <div className="p-6 text-center">Course not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title || course.name}</h1>
            <p className="text-slate-600">{course.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/courses/${id}/edit`)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors font-semibold shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2 inline" />
            Edit Course
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {['overview', 'content'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Modules</p>
                  <p className="text-3xl font-bold text-slate-900">{modules.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Assignments</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Object.values(assignments).reduce((total, moduleAssignments) => total + moduleAssignments.length, 0)}
                  </p>
                </div>
                <FileCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Questions</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Object.values(questions).reduce((total, assignmentQuestions) => total + assignmentQuestions.length, 0)}
                  </p>
                </div>
                <HelpCircle className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Created</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(course.created).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Add Module Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">Course Content</h2>
            <button
              onClick={handleAddModule}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add Module
            </button>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No modules yet</h3>
                <p className="text-slate-500">Add your first module to start building course content</p>
              </div>
            ) : (
              modules.map((module, moduleIndex) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Module Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          {expandedModules[module.id] ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </button>
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Module {moduleIndex + 1}: {module.title}
                          </h3>
                          <p className="text-sm text-slate-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">
                          {assignments[module.id]?.length || 0} assignments
                        </span>
                        <button
                          onClick={() => handleAddAssignment(module.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Module Content */}
                  {expandedModules[module.id] && (
                    <div className="p-4 space-y-4">
                      {/* Module Description */}
                      {module.content && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">{module.content}</p>
                        </div>
                      )}

                      {/* Assignments */}
                      <div className="space-y-3">
                        {assignments[module.id]?.length === 0 ? (
                          <div className="text-center py-4 text-slate-500">
                            No assignments in this module
                          </div>
                        ) : (
                          assignments[module.id]?.map((assignment, assignmentIndex) => (
                            <div key={assignment.id} className="border border-slate-200 rounded-lg overflow-hidden">
                              {/* Assignment Header */}
                              <div className="p-3 bg-green-50 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => toggleAssignment(assignment.id)}
                                      className="p-1 hover:bg-green-100 rounded"
                                    >
                                      {expandedAssignments[assignment.id] ? 
                                        <ChevronDown className="h-4 w-4" /> : 
                                        <ChevronRight className="h-4 w-4" />
                                      }
                                    </button>
                                    <FileCheck className="h-4 w-4 text-green-600" />
                                    <div>
                                      <h4 className="font-medium text-slate-900">
                                        Assignment {assignmentIndex + 1}: {assignment.title}
                                      </h4>
                                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                                        <span>Pass: {assignment.passWeightage}%</span>
                                        <span>Total: {assignment.totalMarks} marks</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-500">
                                      {questions[assignment.id]?.length || 0} questions
                                    </span>
                                    <button
                                      onClick={() => handleAddQuestion(assignment.id, module.id)}
                                      className="p-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Assignment Content */}
                              {expandedAssignments[assignment.id] && (
                                <div className="p-3 space-y-2">
                                  <p className="text-sm text-slate-700">{assignment.description}</p>
                                  
                                  {/* Questions */}
                                  <div className="space-y-2">
                                    {questions[assignment.id]?.length === 0 ? (
                                      <div className="text-center py-2 text-slate-400 text-sm">
                                        No questions in this assignment
                                      </div>
                                    ) : (
                                      questions[assignment.id]?.map((question, questionIndex) => (
                                        <div key={question.id} className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h5 className="font-medium text-sm text-slate-900">
                                                Q{questionIndex + 1}: {question.content?.question || 'No question text'}
                                              </h5>
                                              {question.content?.options && (
                                                <div className="mt-1 space-y-1">
                                                  {question.content.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center space-x-2 text-xs">
                                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
                                                        String.fromCharCode(65 + optionIndex) === question.correctAnswer 
                                                          ? 'bg-green-500' 
                                                          : 'bg-slate-400'
                                                      }`}>
                                                        {String.fromCharCode(65 + optionIndex)}
                                                      </span>
                                                      <span className="text-slate-700">{option}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Working Form Modals */}
      {showModuleForm && (
        <ModuleForm 
          courseId={id}
          onClose={() => setShowModuleForm(false)}
          onSuccess={fetchCourseData}
        />
      )}
      
      {showAssignmentForm && (
        <AssignmentForm 
          moduleId={selectedModule?.id}
          onClose={() => setShowAssignmentForm(false)}
          onSuccess={fetchCourseData}
        />
      )}

      {showQuestionForm && (
        <QuestionForm 
          assignmentId={selectedAssignment?.id}
          moduleId={selectedAssignment?.moduleId}
          onClose={() => setShowQuestionForm(false)}
          onSuccess={() => { setShowQuestionForm(false); fetchCourseData(); }}
        />
      )}
    </div>
  );
};


export default CourseDetail;