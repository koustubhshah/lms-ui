import React, { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import { Search, Eye, RefreshCcw } from 'lucide-react';
import { useSignalR } from '../../contexts/SignalRContext';

const DetailDrawer = ({ open, onClose, trainee, course, assignments, results, onGrade, onMarkComplete, canComplete, onViewCertificate, onDownloadCertificate, onGenerateCertificate }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-xl border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Trainee</div>
            <div className="text-lg font-semibold">{trainee?.name || trainee?.email || trainee?.id}</div>
            <div className="text-sm text-slate-600">Course: {course?.name || course?.title || course?.id}</div>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <h3 className="font-semibold">Assignments</h3>
          <div className="space-y-3">
            {(assignments || []).length === 0 ? (
              <div className="text-slate-500">No assignments for this course</div>
            ) : (
              assignments.map((a) => {
                const r = results.filter(x => x.assignmentId === a.id);
                const latest = r[r.length - 1];
                return (
                  <div key={a.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-slate-600">Module #{a.moduleIndex + 1} • Total: {a.totalMarks} • Pass {a.passWeightage}%</div>
                        {latest ? (
                          <div className="text-xs mt-1">
                            Latest: {latest.marksObtained}/{latest.totalMarks} • {latest.status}
                          </div>
                        ) : (
                          <div className="text-xs mt-1 text-slate-500">No submission</div>
                        )}
                      </div>
                      <button
                        onClick={() => onGrade(a)}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >Grade</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Certificate actions */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Certificate</h3>
            <div className="flex items-center justify-between">
              <CertificateActions onView={onViewCertificate} onDownload={onDownloadCertificate} />
              <button onClick={onGenerateCertificate} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Generate (placeholder)</button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button
            disabled={!canComplete}
            onClick={onMarkComplete}
            className={`px-4 py-2 rounded text-white ${canComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Mark Course Complete
          </button>
        </div>
      </div>
    </div>
  );
};

const CertificateActions = ({ onView, onDownload }) => {
  const [certId, setCertId] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input className="border rounded px-2 py-1" placeholder="Certificate ID" value={certId} onChange={e => setCertId(e.target.value)} />
      <button onClick={() => certId && onView?.(Number(certId))} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">View</button>
      <button onClick={() => certId && onDownload?.(Number(certId))} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Download</button>
    </div>
  );
};

const ProgressOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [modulesByCourse, setModulesByCourse] = useState({});
  const [assignmentsByCourse, setAssignmentsByCourse] = useState({}); // courseId -> [assignments]
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // { trainee, course, enrollment }
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marksObtained: '', totalMarks: '', passWeightage: 40, reAttemptCount: 0 });
  const [saving, setSaving] = useState(false);
  const [drawerAssignments, setDrawerAssignments] = useState([]);
  const [drawerResults, setDrawerResults] = useState([]);
  const [canComplete, setCanComplete] = useState(false);
  const [showReadyOnly, setShowReadyOnly] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [ens, cs, us, rs] = await Promise.all([
        apiService.enrollments.getAll(),
        apiService.courses.getAll(),
        apiService.users.getAll(),
        apiService.results.getAll().catch(() => []),
      ]);
      setEnrollments(ens || []);
      setCourses(cs || []);
      setUsers(us || []);
      setResults(Array.isArray(rs) ? rs : []);

      // Preload modules and assignments per course
      const modulesCache = {};
      const assignmentsCache = {};
      for (const c of (cs || [])) {
        try {
          const mods = await apiService.modules.getByCourse(c.id);
          modulesCache[c.id] = mods;
          const list = [];
          for (const m of (mods || [])) {
            try {
              const as = await apiService.assignments.getByModule(m.id);
              as.forEach(a => list.push({ ...a, moduleId: m.id }));
            } catch {}
          }
          assignmentsCache[c.id] = list;
        } catch {
          modulesCache[c.id] = [];
          assignmentsCache[c.id] = [];
        }
      }
      setModulesByCourse(modulesCache);
      setAssignmentsByCourse(assignmentsCache);
    } catch (e) {
      setError(e?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const onGenerateCertificate = async () => {
  if (!selected) return;
  try {
    const payload = {
      traineeId: selected.trainee.id,
      courseId: selected.course.id,
      traineeFullName: selected.trainee.name,
      courseName: selected.course.name,
      issuedDate: new Date().toISOString()
    };
    const cert = await apiService.certificates.create(payload);
    alert(`Certificate generated (ID: ${cert.id})`);
  } catch (e) {
    alert(e?.message || 'Failed to generate certificate');
  }
};

  const signalR = useSignalR();

  useEffect(() => { load(); }, []);

  // Auto-refresh: listen to SignalR notifications if backend emits, plus polling fallback
  useEffect(() => {
    const onResultAdded = async () => { await load(); };
    const onEnrollmentUpdated = async () => { await load(); };
    signalR.on && signalR.on('ResultAdded', onResultAdded);
    signalR.on && signalR.on('EnrollmentUpdated', onEnrollmentUpdated);

    const interval = setInterval(() => { load(); }, 15000);

    return () => {
      clearInterval(interval);
      signalR.off && signalR.off('ResultAdded', onResultAdded);
      signalR.off && signalR.off('EnrollmentUpdated', onEnrollmentUpdated);
    };
  }, []);

  const items = useMemo(() => {
    const byId = (list, id) => list.find(x => x.id === id);
    return (enrollments || []).map(e => {
      const course = byId(courses, e.courseId) || { id: e.courseId };
      const trainee = byId(users, e.userId) || { id: e.userId };
      const modules = modulesByCourse[e.courseId] || [];
      const allAssignments = assignmentsByCourse[e.courseId] || [];
      const traineeResults = (results || []).filter(r => r.traineeId === e.userId && r.courseId === e.courseId);
      const reviewedSet = new Set(traineeResults.filter(r => (r.status || '').toLowerCase().includes('review')).map(r => r.assignmentId));
      const reviewedCount = allAssignments.filter(a => reviewedSet.has(a.id)).length;
      const totalAssignments = allAssignments.length;
      const assignmentsSubmitted = traineeResults.length;
      const progressPercent = totalAssignments > 0 ? Math.round((reviewedCount / totalAssignments) * 100) : 0;
      return { e, trainee, course, progressPercent, assignmentsSubmitted, modulesTotal: modules.length };
    }).filter(row => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const name = `${row.trainee.firstName || ''} ${row.trainee.lastName || ''}`.toLowerCase();
      return name.includes(q) || String(row.course.id).includes(q) || (row.course.name || row.course.title || '').toLowerCase().includes(q);
    }).filter(row => {
      if (!showReadyOnly) return true;
      return row.progressPercent === 100 && row.e.status !== 'Completed';
    });
  }, [enrollments, courses, users, modulesByCourse, assignmentsByCourse, results, query]);

  const onOpenDetail = async (row) => {
    setSelected({
      trainee: { id: row.trainee.id, name: `${row.trainee.firstName || ''} ${row.trainee.lastName || ''}`.trim(), email: row.trainee.email },
      course: row.course,
      enrollment: row.e,
    });
    // Load assignments by course (via modules)
    try {
      const mods = modulesByCourse[row.course.id] || await apiService.modules.getByCourse(row.course.id);
      const list = [];
      for (let mi = 0; mi < mods.length; mi++) {
        const m = mods[mi];
        try {
          const as = await apiService.assignments.getByModule(m.id);
          as.forEach(a => list.push({ ...a, moduleId: m.id, moduleIndex: mi }));
        } catch {}
      }
      setDrawerAssignments(list);
      const trResults = (results || []).filter(r => r.traineeId === row.trainee.id && r.courseId === row.course.id);
      setDrawerResults(trResults);
      // canComplete when every assignment has a Reviewed result
      const reviewedSet = new Set(trResults.filter(r => (r.status || '').toLowerCase().includes('review')).map(r => r.assignmentId));
      setCanComplete(list.length > 0 && list.every(a => reviewedSet.has(a.id)) ? true : false);
    } catch {
      setDrawerAssignments([]);
      setDrawerResults([]);
      setCanComplete(false);
    }
  };

  const onGrade = async (assignment) => {
    setGradingAssignment(assignment);
    setGradeForm({ marksObtained: '', totalMarks: assignment.totalMarks || '', passWeightage: assignment.passWeightage || 40, reAttemptCount: 0 });
  };

  const submitGrade = async () => {
    if (!gradingAssignment || !selected) return;
    setSaving(true);
    try {
      const payload = {
        id: 0,
        assignmentId: gradingAssignment.id,
        moduleId: gradingAssignment.moduleId,
        courseId: selected.course.id,
        traineeId: selected.trainee.id,
        marksObtained: Number(gradeForm.marksObtained),
        totalMarks: Number(gradeForm.totalMarks),
        status: 'Reviewed',
        feedback: (gradeForm.feedback && gradeForm.feedback.trim()) ? gradeForm.feedback : 'Reviewed by admin',
        created: new Date().toISOString(),
        reAttemptCount: Number(gradeForm.reAttemptCount) || 0,
      };
      await apiService.results.add(payload, Number(gradeForm.passWeightage));
      await load();
      setGradingAssignment(null);
    } catch (e) {
      alert(e?.message || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const onMarkComplete = async () => {
    if (!selected) return;
    try {
      await apiService.enrollments.update(selected.enrollment.id, { ...selected.enrollment, statuses: 'Completed' });
      await load();
      setSelected(null);
    } catch (e) {
      alert(e?.message || 'Failed to mark completed');
    }
  };

  const onViewCertificate = async (id) => {
    try {
      const data = await apiService.certificates.getById(Number(id));
      alert(`Certificate ID ${data.id}\nTrainee: ${data.traineeFullName}\nCourse: ${data.courseName}`);
    } catch (e) {
      alert(e?.message || 'Failed to view certificate');
    }
  };

  const onDownloadCertificate = async (id) => {
    try {
      const blob = await apiService.certificates.download(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.message || 'Failed to download certificate');
    }
  };

  if (loading) return <LoadingSpinner message="Loading progress..." />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Progress Overview</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search trainee or course" className="pl-8 pr-3 py-2 border rounded-lg" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={showReadyOnly} onChange={(e) => setShowReadyOnly(e.target.checked)} />
            <span>Ready to Complete</span>
          </label>
          <button onClick={load} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"><RefreshCcw className="h-4 w-4"/>Refresh</button>
        </div>
      </div>

      {error && <div className="p-3 rounded-md bg-red-100 border border-red-200 text-red-700">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 gap-2 px-4 py-3 border-b text-sm font-semibold text-slate-700">
          <div>Trainee</div>
          <div>Course</div>
          <div>Progress</div>
          <div>Modules</div>
          <div>Assignments Submitted</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {(items || []).length === 0 ? (
          <div className="p-6 text-slate-500">No enrollments found</div>
        ) : (
          items.map(row => (
            <div key={row.e.id} className="grid grid-cols-7 gap-2 px-4 py-3 border-b text-sm items-center">
              <div>{row.trainee.firstName ? `${row.trainee.firstName} ${row.trainee.lastName || ''}` : row.trainee.email || row.trainee.id}</div>
              <div>{row.course.name || row.course.title || row.course.id}</div>
              <div>
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${row.progressPercent}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>{row.progressPercent}%</span>
                  {row.progressPercent === 100 && row.e.status !== 'Completed' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Ready to Complete</span>
                  )}
                </div>
              </div>
              <div>{row.modulesTotal}</div>
              <div>{row.assignmentsSubmitted}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${row.e.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{row.e.status}</span>
              </div>
              <div className="text-right space-x-2">
                <button onClick={() => onOpenDetail(row)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 inline-flex items-center gap-1"><Eye className="h-3 w-3"/>View</button>
                {row.progressPercent === 100 && row.e.status !== 'Completed' && (
                  <button onClick={async () => { setSelected({ trainee: row.trainee, course: row.course, enrollment: row.e }); await onMarkComplete(); }} className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Complete now</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <DetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        trainee={selected?.trainee}
        course={selected?.course}
        assignments={drawerAssignments}
        results={drawerResults}
        onGrade={(a) => onGrade(a)}
        onMarkComplete={onMarkComplete}
        canComplete={selected ? (selected.enrollment?.status === 'Completed' ? false : canComplete) : false}
        onViewCertificate={onViewCertificate}
        onDownloadCertificate={onDownloadCertificate}
        onGenerateCertificate={onGenerateCertificate}
      />

      {gradingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200">
            <div className="p-4 border-b font-semibold">Grade Assignment</div>
            <div className="p-4 space-y-3">
              <div className="text-sm text-slate-700">{gradingAssignment.title}</div>
              <div className="grid grid-cols-2 gap-3">
                <input className="border rounded p-2" placeholder="Marks Obtained" value={gradeForm.marksObtained} onChange={e => setGradeForm(f => ({ ...f, marksObtained: e.target.value }))} />
                <input className="border rounded p-2" placeholder="Total Marks" value={gradeForm.totalMarks} onChange={e => setGradeForm(f => ({ ...f, totalMarks: e.target.value }))} />
                <input className="border rounded p-2" placeholder="Pass %" value={gradeForm.passWeightage} onChange={e => setGradeForm(f => ({ ...f, passWeightage: e.target.value }))} />
                <input className="border rounded p-2" placeholder="Re-attempts" value={gradeForm.reAttemptCount} onChange={e => setGradeForm(f => ({ ...f, reAttemptCount: e.target.value }))} />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={() => setGradingAssignment(null)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button disabled={saving} onClick={submitGrade} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{saving ? 'Saving...' : 'Save Grade'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;
