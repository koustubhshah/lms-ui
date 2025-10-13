import React, { useEffect, useMemo, useState } from 'react';
import { useSignalR } from '../../contexts/SignalRContext';
import { useToast } from '../../contexts/ToastContext';
import Layout from '../layout/Layout';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Plus, Trash2, Edit, RefreshCcw } from 'lucide-react';

const EnrollmentForm = ({ open, onClose, onSaved, initial }) => {
  const isEditing = Boolean(initial?.id);
  const [form, setForm] = useState({
    id: initial?.id ?? 0,
    courseId: initial?.courseId ?? '',
    traineeId: initial?.userId ?? initial?.traineeId ?? '',
    statuses: initial?.status ?? 'Active',
    enrolled: initial?.enrollmentDate ?? initial?.enrolled ?? undefined,
  });
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [cs, us] = await Promise.all([
          apiService.courses.getAll(),
          apiService.users.getAll(),
        ]);
        setCourses(cs || []);
        setUsers(us || []);
      } catch (e) {
        setError(e?.message || 'Failed to load form data');
      }
    })();
  }, [open]);

  useEffect(() => {
    setForm({
      id: initial?.id ?? 0,
      courseId: initial?.courseId ?? '',
      traineeId: initial?.userId ?? initial?.traineeId ?? '',
      statuses: initial?.status ?? 'Active',
      enrolled: initial?.enrollmentDate ?? initial?.enrolled ?? undefined,
    });
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEditing) {
        await apiService.enrollments.update(form.id, form);
      } else {
        await apiService.enrollments.create(form);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Failed to save enrollment');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-gray-700">
        <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">{isEditing ? 'Edit Enrollment' : 'Add Enrollment'}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">Close</button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-gray-200">Course</label>
            <select name="courseId" value={form.courseId} onChange={onChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg px-3 py-2">
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-gray-200">Trainee</label>
            <select name="traineeId" value={form.traineeId} onChange={onChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg px-3 py-2">
              <option value="">Select trainee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.userName || u.email || u.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-gray-200">Status</label>
            <select name="statuses" value={form.statuses} onChange={onChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg px-3 py-2">
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

const EnrollmentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const signalR = useSignalR();
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.enrollments.getAll();
      setItems(data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Real-time: EnrollmentCompleted event
  useEffect(() => {
    const handler = (payload) => {
      toast.info(`Enrollment #${payload?.enrollmentId} completed`);
      load();
    };
    signalR.on('EnrollmentCompleted', handler);
    return () => {
      signalR.off('EnrollmentCompleted', handler);
    };
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const t = setInterval(() => {
      load();
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    try {
      await apiService.enrollments.delete(id);
      load();
    } catch (e) {
      alert(e?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner message="Loading enrollments..." />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-gray-100">Enrollment Management</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-700 dark:text-gray-200">Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button onClick={load} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"><RefreshCcw className="h-4 w-4"/>Refresh</button>
          <button onClick={() => { setEditing(null); setOpenForm(true); }} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus className="h-4 w-4"/>Add</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">{error}</div>}

      {items.length === 0 ? (
        <div className="p-8 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-center text-slate-500 dark:text-gray-300">No enrollments yet</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-slate-200 dark:border-gray-700 text-sm font-semibold text-slate-700 dark:text-gray-200">
            <div>ID</div>
            <div>Course</div>
            <div>Trainee</div>
            <div>Status</div>
            <div>Enrolled</div>
            <div className="text-right">Actions</div>
          </div>
          {items
            .filter(e => statusFilter === 'All' ? true : (e.status === statusFilter))
            .map(e => (
            <div key={e.id} className="grid grid-cols-6 gap-2 px-4 py-3 border-b border-slate-200 dark:border-gray-700 text-sm items-center text-slate-800 dark:text-gray-100">
              <div>{e.id}</div>
              <div>{e.course?.name || e.Course?.name || e.courseId}</div>
              <div>{(e.trainee?.firstName && `${e.trainee.firstName} ${e.trainee.lastName || ''}`) || (e.Trainee?.firstName && `${e.Trainee.firstName} ${e.Trainee.lastName || ''}`) || e.userId}</div>
              <div><span className={`px-2 py-1 rounded-full text-xs ${
                e.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                e.status === 'Active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                e.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-200'
              }`}>{e.status}</span></div>
              <div>{e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString() : (e.enrolled ? new Date(e.enrolled).toLocaleDateString() : '-')}</div>
              <div className="text-right space-x-2">
                <button onClick={() => { setEditing(e); setOpenForm(true); }} className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-lg inline-flex items-center gap-1"><Edit className="h-3 w-3"/>Edit</button>
                <button onClick={() => onDelete(e.id)} className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg inline-flex items-center gap-1"><Trash2 className="h-3 w-3"/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EnrollmentForm
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSaved={load}
      />
    </div>
  );
};

export default EnrollmentManagement;
