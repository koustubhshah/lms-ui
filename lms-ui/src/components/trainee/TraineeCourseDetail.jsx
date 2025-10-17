import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, FileCheck, ArrowLeft, X } from 'lucide-react';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackForm from './FeedbackForm';

const storageKey = (userId, courseId) => `lms_progress_${userId}_${courseId}`;
const assignmentKey = (userId, courseId) => `lms_assignment_${userId}_${courseId}`;
const progressSummaryKey = (userId, courseId) => `lms_progress_summary_${userId}_${courseId}`;

const QuizModal = ({ open, onClose, assignment, moduleId, onSubmitted }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !assignment?.id) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const qs = await apiService.questions.getByAssignment(assignment.id);
        setQuestions(qs || []);
      } catch (e) {
        setError(e?.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, assignment?.id]);

  const onChange = (qid, value) => setAnswers(prev => ({ ...prev, [qid]: value }));

  const submit = () => {
    if (!questions.length) return onClose?.();
    // Simple scoring client-side
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id] === q.correctAnswer) correct += 1;
    });
    const total = questions.length;
    const scorePct = Math.round((correct / total) * 100);
    onSubmitted?.({
      assignmentId: assignment.id,
      moduleId,
      totalQuestions: total,
      correct,
      scorePct,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
    });
    onClose?.();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{assignment?.title || 'Quiz'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <LoadingSpinner message="Loading questions..." />
          ) : error ? (
            <div className="p-3 rounded bg-red-100 text-red-700 border border-red-200">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-slate-600">No questions found.</div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="border rounded-lg p-3">
                <div className="font-medium mb-2">Q{i + 1}. {q.content?.question || 'Question'}</div>
                <div className="space-y-2">
                  {(q.content?.options || []).map((opt, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={`q_${q.id}`} value={label} checked={answers[q.id] === label} onChange={() => onChange(q.id, label)} />
                        <span>{label}. {opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Submit</button>
        </div>
      </div>
    </div>
  );
};

const TraineeCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [localProgress, setLocalProgress] = useState({}); // { [moduleId]: boolean }
  const [error, setError] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState({}); // { [assignmentId]: { status, scorePct, submittedAt } }
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        const [c, ms, myResults] = await Promise.all([
          apiService.courses.getById(courseId),
          apiService.modules.getByCourse(courseId),
          apiService.results.getMine().catch(() => []),
        ]);
        setCourse(c);
        setModules(ms);
        setResults(Array.isArray(myResults) ? myResults : []);

        const assigns = {};
        for (const m of ms) {
          try {
            assigns[m.id] = await apiService.assignments.getByModule(m.id);
          } catch {
            assigns[m.id] = [];
          }
        }
        setAssignments(assigns);

        // Load local progress
        const saved = localStorage.getItem(storageKey(user?.id, courseId));
        setLocalProgress(saved ? JSON.parse(saved) : {});

        // Load local assignment statuses
        const savedAssign = localStorage.getItem(assignmentKey(user?.id, courseId));
        let parsedAssign = savedAssign ? JSON.parse(savedAssign) : {};

        // Overlay backend results as Reviewed
        if (Array.isArray(myResults)) {
          myResults.forEach(r => {
            if (r.assignmentId) {
              parsedAssign[r.assignmentId] = {
                ...(parsedAssign[r.assignmentId] || {}),
                status: 'Reviewed',
                scorePct: Math.round(((r.marksObtained ?? 0) / (r.totalMarks || 1)) * 100),
                reviewedAt: r.created || r.date || new Date().toISOString(),
              };
            }
          });
        }
        setAssignmentStatus(parsedAssign);
        localStorage.setItem(assignmentKey(user?.id, courseId), JSON.stringify(parsedAssign));
      } catch (e) {
        setError(e?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) init();
  }, [courseId, user?.id]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const markModuleComplete = (moduleId, value) => {
    setLocalProgress(prev => {
      const next = { ...prev, [moduleId]: value };
      localStorage.setItem(storageKey(user?.id, courseId), JSON.stringify(next));
      return next;
    });
  };

  const derivedProgress = useMemo(() => {
    if (!modules || modules.length === 0) return 0;

    // Use backend results if available in future (e.g., per-assignment results)
    // For now, combine local completion toggles per module.
    const completed = modules.filter(m => localProgress[m.id]).length;
    const pct = Math.round((completed / modules.length) * 100);
    // Save summary for dashboard
    try {
      localStorage.setItem(progressSummaryKey(user?.id, courseId), JSON.stringify({
        percent: pct,
        modulesTotal: modules.length,
        modulesCompleted: completed,
      }));
    } catch {}
    return pct;
  }, [modules, localProgress]);

  const openQuiz = (assignment, moduleId) => {
    setActiveAssignment(assignment);
    setActiveModuleId(moduleId);
    setQuizOpen(true);
  };

  const onQuizSubmitted = async (payload) => {
    // 1) Save locally
    setAssignmentStatus(prev => {
      const scorePct = Math.round((payload.correct / (payload.totalQuestions || 1)) * 100);
      const next = {
        ...prev,
        [payload.assignmentId]: { ...payload, scorePct, status: 'Reviewed' },
      };
      try {
        localStorage.setItem(assignmentKey(user?.id, courseId), JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2) Persist to backend as an auto-graded Reviewed result so Admin sees progress
    try {
      // Find assignment details to get passWeightage
      const allAssignments = Object.values(assignments || {}).flat();
      const a = allAssignments.find(x => x.id === payload.assignmentId);
      const pass = a?.passWeightage ?? 40;

      const resultPayload = {
        id: 0,
        assignmentId: payload.assignmentId,
        moduleId: payload.moduleId,
        courseId: Number(courseId),
        traineeId: user.id,
        marksObtained: Number(payload.correct) || 0,
        totalMarks: Number(payload.totalQuestions) || 0,
        status: 'Reviewed',
        feedback: 'Auto-graded submission',
        created: new Date().toISOString(),
        reAttemptCount: 0,
      };
      await apiService.results.add(resultPayload, Number(pass));

      // Optionally refresh my results state
      try {
        const myResults = await apiService.results.getMine();
        setResults(Array.isArray(myResults) ? myResults : []);
      } catch {}
    } catch (err) {
      console.error('Failed to persist quiz result:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading course..." />;
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/trainee/dashboard')}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title || course.name}</h1>
            <p className="text-slate-600">{course.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <div className="text-sm font-medium text-slate-700 mb-1">Progress</div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${derivedProgress}%` }} />
            </div>
            <div className="text-right text-xs text-slate-600 mt-1">{derivedProgress}%</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 border border-red-200">{error}</div>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No modules yet</h3>
            <p className="text-slate-500">Modules will appear here once added by the instructor</p>
          </div>
        ) : (
          modules.map((module, moduleIndex) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleModule(module.id)} className="p-1 hover:bg-slate-200 rounded">
                      {expandedModules[module.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Module {moduleIndex + 1}: {module.title}</h3>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!localProgress[module.id]}
                      onChange={(e) => markModuleComplete(module.id, e.target.checked)}
                    />
                    <span className="text-slate-700">Mark complete</span>
                  </label>
                </div>
              </div>

              {expandedModules[module.id] && (
                <div className="p-4 space-y-4">
                  {module.content && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">{module.content}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(assignments[module.id] || []).length === 0 ? (
                      <div className="text-center py-4 text-slate-500">No assignments in this module</div>
                    ) : (
                      assignments[module.id].map((assignment, idx) => (
                        <div key={assignment.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="p-3 bg-green-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <div>
                                <h4 className="font-medium text-slate-900">Assignment {idx + 1}: {assignment.title}</h4>
                                <div className="text-sm text-slate-600">Total: {assignment.totalMarks} | Pass: {assignment.passWeightage}%</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignmentStatus[assignment.id]?.status && (
                                <span className={`px-2 py-1 text-xs rounded-full ${assignmentStatus[assignment.id].status === 'Reviewed' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {assignmentStatus[assignment.id].status}
                                  {typeof assignmentStatus[assignment.id].scorePct === 'number' && ` • ${assignmentStatus[assignment.id].scorePct}%`}
                                </span>
                              )}
                              <button
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                onClick={() => openQuiz(assignment, module.id)}
                              >
                                {assignmentStatus[assignment.id]?.status ? 'Retake' : 'Start'}
                              </button>
                            </div>
                          </div>
                          {assignment.description && (
                            <div className="p-3 text-sm text-slate-700">{assignment.description}</div>
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

      {/* Feedback */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-lg font-semibold mb-2">Course Feedback</h3>
        <FeedbackForm courseId={courseId} />
      </div>

      {/* Quiz modal */}
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        assignment={activeAssignment}
        moduleId={activeModuleId}
        onSubmitted={onQuizSubmitted}
      />
    </div>
  );
};

export default TraineeCourseDetail;
