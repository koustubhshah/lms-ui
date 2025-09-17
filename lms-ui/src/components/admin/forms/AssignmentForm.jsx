import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiService from '../../../services/api';

const AssignmentForm = ({ moduleId, assignment, isEditing, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    moduleId: moduleId,
    title: '',
    description: '',
    passWeightage: 50,
    totalMarks: 100
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && assignment) {
      setFormData({
        moduleId: assignment.moduleId,
        title: assignment.title || '',
        description: assignment.description || '',
        passWeightage: assignment.passWeightage || 50,
        totalMarks: assignment.totalMarks || 100
      });
    }
  }, [isEditing, assignment]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.passWeightage < 1 || formData.passWeightage > 100) {
      newErrors.passWeightage = 'Pass weightage must be between 1-100%';
    }
    if (formData.totalMarks < 1) {
      newErrors.totalMarks = 'Total marks must be greater than 0';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await apiService.assignments.update(assignment.id, formData);
      } else {
        await apiService.assignments.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('Failed to save assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Assignment' : 'Add New Assignment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter assignment title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter assignment description and instructions"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pass Weightage (%) *
              </label>
              <input
                type="number"
                name="passWeightage"
                value={formData.passWeightage}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.passWeightage ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="50"
              />
              {errors.passWeightage && (
                <p className="mt-1 text-sm text-red-600">{errors.passWeightage}</p>
              )}
              <p className="mt-1 text-sm text-slate-500">
                Minimum percentage required to pass this assignment
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.totalMarks ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="100"
              />
              {errors.totalMarks && (
                <p className="mt-1 text-sm text-red-600">{errors.totalMarks}</p>
              )}
              <p className="mt-1 text-sm text-slate-500">
                Maximum marks for this assignment
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-800 mb-2">Assignment Settings</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Pass Marks: {Math.ceil((formData.passWeightage / 100) * formData.totalMarks)} out of {formData.totalMarks}</p>
              <p>• You can add questions to this assignment after creating it</p>
              <p>• Total marks will be distributed among all questions</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;