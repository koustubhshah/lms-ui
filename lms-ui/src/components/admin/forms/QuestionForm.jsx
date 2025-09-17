import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import apiService from '../../../services/api';

const QuestionForm = ({ assignmentId, moduleId, question, isEditing, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    assignmentId: assignmentId,
    moduleId: moduleId,
    correctAnswer: 'A',
    content: {
      question: '',
      options: ['', '', '', '']
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && question) {
      setFormData({
        assignmentId: question.assignmentId,
        moduleId: question.moduleId,
        correctAnswer: question.correctAnswer || 'A',
        content: {
          question: question.content?.question || '',
          options: question.content?.options || ['', '', '', '']
        }
      });
    }
  }, [isEditing, question]);

  const handleQuestionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        question: e.target.value
      }
    }));
    if (errors.question) {
      setErrors(prev => ({ ...prev, question: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        options: prev.content.options.map((option, i) => i === index ? value : option)
      }
    }));
    if (errors[`option${index}`]) {
      setErrors(prev => ({ ...prev, [`option${index}`]: '' }));
    }
  };

  const handleCorrectAnswerChange = (e) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: e.target.value
    }));
    if (errors.correctAnswer) {
      setErrors(prev => ({ ...prev, correctAnswer: '' }));
    }
  };

  const addOption = () => {
    if (formData.content.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          options: [...prev.content.options, '']
        }
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.content.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          options: prev.content.options.filter((_, i) => i !== index)
        }
      }));
      // Adjust correct answer if needed
      const optionLetter = String.fromCharCode(65 + index);
      if (formData.correctAnswer === optionLetter) {
        setFormData(prev => ({
          ...prev,
          correctAnswer: 'A'
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.content.question.trim()) {
      newErrors.question = 'Question text is required';
    }

    formData.content.options.forEach((option, index) => {
      if (!option.trim()) {
        newErrors[`option${index}`] = `Option ${String.fromCharCode(65 + index)} is required`;
      }
    });

    const correctAnswerIndex = formData.correctAnswer.charCodeAt(0) - 65;
    if (correctAnswerIndex >= formData.content.options.length) {
      newErrors.correctAnswer = 'Please select a valid correct answer';
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
        await apiService.questions.update(question.id, formData);
      } else {
        await apiService.questions.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Edit Question' : 'Add New Question'}
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
              Question Text *
            </label>
            <textarea
              value={formData.content.question}
              onChange={handleQuestionChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.question ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter your question here..."
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Answer Options *
              </label>
              <button
                type="button"
                onClick={addOption}
                disabled={formData.content.options.length >= 6}
                className="text-sm text-purple-600 hover:text-purple-700 disabled:text-slate-400"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {formData.content.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors[`option${index}`] ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    />
                    {errors[`option${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`option${index}`]}</p>
                    )}
                  </div>
                  {formData.content.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Correct Answer *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {formData.content.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <label
                    key={index}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      formData.correctAnswer === letter
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={letter}
                      checked={formData.correctAnswer === letter}
                      onChange={handleCorrectAnswerChange}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                      formData.correctAnswer === letter
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {letter}
                    </div>
                    <span className="text-sm truncate">{option || `Option ${letter}`}</span>
                  </label>
                );
              })}
            </div>
            {errors.correctAnswer && (
              <p className="mt-2 text-sm text-red-600">{errors.correctAnswer}</p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h4 className="font-medium text-purple-800 mb-3">Question Preview</h4>
            <div className="text-sm">
              <p className="font-medium text-slate-900 mb-2">
                {formData.content.question || 'Your question will appear here...'}
              </p>
              <div className="space-y-1">
                {formData.content.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                      String.fromCharCode(65 + index) === formData.correctAnswer
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-slate-700">{option || `Option ${String.fromCharCode(65 + index)}`}</span>
                  </div>
                ))}
              </div>
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
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;