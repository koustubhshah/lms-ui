import React, { useEffect, useState } from "react";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function TraineeEnrollments() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.id) return;
        const data = await apiService.enrollments.getByUser(user.id);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error(e?.message || "Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-slate-600">Loading your enrollments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">My Enrollments</h1>
      {items.length === 0 ? (
        <div className="p-6 bg-white border border-slate-200 rounded-xl text-slate-600">No enrollments found.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-slate-200 text-sm font-semibold text-slate-700">
            <div>Course</div>
            <div>Status</div>
            <div>Enrolled</div>
            <div>Certificate</div>
          </div>
          {items.map(e => (
            <div key={e.id} className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-slate-200 text-sm items-center">
              <div>{e.course?.name || e.Course?.name || e.courseId}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  e.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  e.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                  e.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                }`}>{e.status}</span>
              </div>
              <div>{e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString() : (e.enrolled ? new Date(e.enrolled).toLocaleDateString() : '-')}</div>
              <div className="flex items-center gap-2">
                {e.status === 'Active' && (
                  <button
                    onClick={async () => {
                      try {
                        await apiService.enrollments.complete(e.id);
                        toast.success('Marked as completed');
                        // refresh
                        const data = await apiService.enrollments.getByUser(user.id);
                        setItems(Array.isArray(data) ? data : []);
                      } catch (err) {
                        toast.error(err?.message || 'Failed to mark completed');
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                  >
                    Mark Completed
                  </button>
                )}
                {!e.status && <span className="text-slate-400">—</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}