import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const key = (userId, courseId) => `lms_feedback_${userId}_${courseId}`;

const FeedbackForm = ({ courseId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(key(user?.id, courseId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRating(parsed.rating || 0);
        setComment(parsed.comment || '');
        setSavedAt(parsed.savedAt || null);
      } catch {}
    }
  }, [courseId, user?.id]);

  const submit = (e) => {
    e.preventDefault();
    const payload = { rating: Number(rating) || 0, comment: comment?.trim() || '', savedAt: new Date().toISOString() };
    localStorage.setItem(key(user?.id, courseId), JSON.stringify(payload));
    setSavedAt(payload.savedAt);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-700">Rating:</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="border rounded px-2 py-1">
          <option value={0}>Select</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      <textarea
        className="w-full border rounded p-2"
        placeholder="Your feedback..."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <button className="px-4 py-2 rounded bg-slate-900 text-white hover:bg-black" type="submit">Save Feedback</button>
        {savedAt && <div className="text-xs text-slate-500">Saved {new Date(savedAt).toLocaleString()}</div>}
      </div>
    </form>
  );
};

export default FeedbackForm;
