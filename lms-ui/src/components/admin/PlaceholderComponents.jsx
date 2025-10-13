import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';

// These are placeholder components - you can expand them later

export const ModuleManagement = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Module Management</h1>
    <p className="text-slate-600">Manage course modules and lessons</p>
    <div className="mt-8 p-8 bg-blue-50 rounded-xl">
      <p className="text-blue-700">Module management interface will be implemented here</p>
    </div>
  </div>
);

export const AssignmentManagement = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Assignment Management</h1>
    <p className="text-slate-600">Create and manage assignments and quizzes</p>
    <div className="mt-8 p-8 bg-green-50 rounded-xl">
      <p className="text-green-700">Assignment management interface will be implemented here</p>
    </div>
  </div>
);

export const UserManagement = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">User Management</h1>
    <p className="text-slate-600">Manage user accounts and permissions</p>
    <div className="mt-8 p-8 bg-purple-50 rounded-xl">
      <p className="text-purple-700">User management interface will be implemented here</p>
    </div>
  </div>
);

export const EnrollmentManagement = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Enrollment Management</h1>
    <p className="text-slate-600">Manage course enrollments and student registrations</p>
    <div className="mt-8 p-8 bg-orange-50 rounded-xl">
      <p className="text-orange-700">Enrollment management interface will be implemented here</p>
    </div>
  </div>
);

export const ResultManagement = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assignmentId: '',
    moduleId: '',
    courseId: '',
    traineeId: '',
    marksObtained: '',
    totalMarks: '',
    status: '',
    feedback: '',
    reAttemptCount: 0,
    passWeightage: 40,
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await apiService.results.getAll();
        setResults(Array.isArray(res) ? res : []);
      } catch (e) {
        setError(e.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        id: 0,
        assignmentId: Number(form.assignmentId),
        moduleId: Number(form.moduleId),
        courseId: Number(form.courseId),
        traineeId: Number(form.traineeId),
        marksObtained: Number(form.marksObtained),
        totalMarks: Number(form.totalMarks),
        status: form.status || undefined,
        feedback: form.feedback || undefined,
        created: new Date().toISOString(),
        reAttemptCount: Number(form.reAttemptCount) || 0,
      };
      await apiService.results.add(payload, Number(form.passWeightage));
      const res = await apiService.results.getAll();
      setResults(Array.isArray(res) ? res : []);
      alert('Result added');
    } catch (e) {
      setError(e.message || 'Failed to add result');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Results Management</h1>
      {loading ? (
        <LoadingSpinner message="Loading results..." />
      ) : (
        <>
          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-700 border border-red-200">{error}</div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold mb-3">All Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 border-b">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Trainee</th>
                      <th className="py-2 pr-4">Course</th>
                      <th className="py-2 pr-4">Module</th>
                      <th className="py-2 pr-4">Assignment</th>
                      <th className="py-2 pr-4">Marks</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td className="py-4" colSpan={7}>No results found</td>
                      </tr>
                    ) : (
                      results.map((r) => (
                        <tr key={r.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-4">{r.id}</td>
                          <td className="py-2 pr-4">{r.traineeId}</td>
                          <td className="py-2 pr-4">{r.courseId}</td>
                          <td className="py-2 pr-4">{r.moduleId}</td>
                          <td className="py-2 pr-4">{r.assignmentId}</td>
                          <td className="py-2 pr-4">{r.marksObtained} / {r.totalMarks}</td>
                          <td className="py-2 pr-4">{r.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-lg font-semibold mb-3">Add Result</h2>
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="traineeId" placeholder="Trainee ID" className="border rounded p-2" value={form.traineeId} onChange={handleChange} required />
                  <input name="courseId" placeholder="Course ID" className="border rounded p-2" value={form.courseId} onChange={handleChange} required />
                  <input name="moduleId" placeholder="Module ID" className="border rounded p-2" value={form.moduleId} onChange={handleChange} required />
                  <input name="assignmentId" placeholder="Assignment ID" className="border rounded p-2" value={form.assignmentId} onChange={handleChange} required />
                  <input name="marksObtained" placeholder="Marks Obtained" className="border rounded p-2" value={form.marksObtained} onChange={handleChange} required />
                  <input name="totalMarks" placeholder="Total Marks" className="border rounded p-2" value={form.totalMarks} onChange={handleChange} required />
                  <input name="passWeightage" placeholder="Pass % (e.g., 40)" className="border rounded p-2" value={form.passWeightage} onChange={handleChange} />
                  <input name="reAttemptCount" placeholder="Re-Attempts" className="border rounded p-2" value={form.reAttemptCount} onChange={handleChange} />
                </div>
                <input name="status" placeholder="Status (optional)" className="border rounded p-2 w-full" value={form.status} onChange={handleChange} />
                <input name="feedback" placeholder="Feedback (optional)" className="border rounded p-2 w-full" value={form.feedback} onChange={handleChange} />
                <button type="submit" className="w-full bg-blue-600 text-white rounded p-2">Add</button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const CertificateManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewId, setViewId] = useState('');
  const [certificate, setCertificate] = useState(null);

  const handleView = async (e) => {
    e.preventDefault();
    setError('');
    setCertificate(null);
    try {
      setLoading(true);
      const data = await apiService.certificates.getById(Number(viewId));
      setCertificate(data);
    } catch (e) {
      setError(e.message || 'Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    setError('');
    try {
      const blob = await apiService.certificates.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Failed to download');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Certificate Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold mb-3">View Certificate by ID</h2>
          <form onSubmit={handleView} className="flex gap-3">
            <input className="border rounded p-2 flex-1" placeholder="Certificate ID" value={viewId} onChange={e => setViewId(e.target.value)} />
            <button className="bg-blue-600 text-white rounded px-4">View</button>
          </form>
          {loading && <div className="mt-3"><LoadingSpinner message="Loading certificate..." /></div>}
          {error && <div className="mt-3 p-3 rounded-md bg-red-100 text-red-700 border border-red-200">{error}</div>}
          {certificate && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-slate-700"><span className="font-semibold">ID:</span> {certificate.id}</div>
              <div className="text-sm text-slate-700"><span className="font-semibold">Trainee:</span> {certificate.traineeFullName} (ID: {certificate.traineeId})</div>
              <div className="text-sm text-slate-700"><span className="font-semibold">Course:</span> {certificate.courseName} (ID: {certificate.courseId})</div>
              <div className="text-sm text-slate-700"><span className="font-semibold">Issued:</span> {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : '-'}</div>
              <button onClick={() => handleDownload(certificate.id)} className="mt-2 bg-green-600 text-white rounded px-4 py-2">Download PDF</button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Notes</h2>
          <p className="text-slate-600 text-sm">Listing certificates and creation endpoints are not available in the provided backend. You can view a specific certificate using its ID and download it as a PDF.</p>
        </div>
      </div>
    </div>
  );
};

export const SearchPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Search</h1>
    <p className="text-slate-600">Search across courses, users, and content</p>
    <div className="mt-8 p-8 bg-indigo-50 rounded-xl">
      <p className="text-indigo-700">Search interface will be implemented here</p>
    </div>
  </div>
);

export const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-900 mb-4">Settings</h1>
    <p className="text-slate-600">System settings and configuration</p>
    <div className="mt-8 p-8 bg-slate-50 rounded-xl">
      <p className="text-slate-700">Settings interface will be implemented here</p>
    </div>
  </div>
);