import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useSignalR } from "../../contexts/SignalRContext";
import { useToast } from "../../contexts/ToastContext";

const NotificationBell = ({ visible = true }) => {
  const signalR = useSignalR();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (payload) => {
      const item = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: 'enrollmentCompleted',
        title: `Enrollment #${payload?.enrollmentId} completed`,
        detail: `Trainee ${payload?.traineeId} completed course ${payload?.courseId}`,
        at: payload?.completedAt || new Date().toISOString(),
        read: false,
      };
      setItems(prev => [item, ...prev].slice(0, 20));
      toast.info(item.title);
    };
    signalR.on('EnrollmentCompleted', handler);
    return () => signalR.off('EnrollmentCompleted', handler);
  }, [visible]);

  // Listen for course assignment notifications (admin assigned a course to trainee)
  useEffect(() => {
    if (!visible) return;
    const onAssigned = (payload) => {
      const item = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type: 'courseAssigned',
        title: `New course assigned` ,
        detail: `Course ${payload?.courseName || payload?.courseId} assigned by admin`,
        at: payload?.assignedAt || new Date().toISOString(),
        read: false,
      };
      setItems(prev => [item, ...prev].slice(0, 20));
      toast.success(item.title);
    };
    signalR.on('CourseAssigned', onAssigned);
    return () => signalR.off('CourseAssigned', onAssigned);
  }, [visible]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (!visible) return null;

  const unread = items.filter(i => !i.read).length;

  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, read: true })));
  const clearAll = () => setItems([]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex items-center gap-2">
              <button onClick={markAllRead} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                <Check className="h-3 w-3" /> Read all
              </button>
              <button onClick={clearAll} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            ) : (
              items.map(n => (
                <div key={n.id} className={`px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-700 ${n.read ? 'opacity-75' : ''}`}>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-gray-500">{n.detail}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(n.at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;