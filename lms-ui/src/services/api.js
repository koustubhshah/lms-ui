// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5284/api", 
  IDENTITY_URL: "http://localhost:5210/api/Identity", 
  TIMEOUT: 10000,
};

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.identityURL = API_CONFIG.IDENTITY_URL;
  }

  // Normalize helper(s)
  normalizeQuestion(q) {
    if (!q) return q;
    // Map backend `contentJson` to frontend `content`
    const content = q.content ?? q.contentJson ?? null;
    return { ...q, content };
  }

  normalizeEnrollment(e) {
    if (!e) return e;
    const status = e.status ?? e.Statuses ?? e.statuses ?? null;
    const enrolled = e.enrolled ?? e.Created ?? e.enrollmentDate ?? null;
    const enrollmentDate = e.enrollmentDate ?? enrolled ?? null;
    const userId = e.userId ?? e.traineeId ?? e.TraineeId ?? null;
    const courseId = e.courseId ?? e.CourseId ?? null;
    return {
      ...e,
      status,
      enrolled,
      enrollmentDate,
      userId,
      courseId,
    };
  }

  normalizeResult(r) {
    if (!r) return r;
    const id = r.id ?? r.Id;
    const assignmentId = r.assignmentId ?? r.AssignmentId;
    const moduleId = r.moduleId ?? r.ModuleId;
    const courseId = r.courseId ?? r.CourseId;
    const traineeId = r.traineeId ?? r.TraineeId;
    const marksObtained = r.marksObtained ?? r.MarksObtained ?? 0;
    const totalMarks = r.totalMarks ?? r.TotalMarks ?? 0;
    const status = r.status ?? r.Status ?? '';
    const feedback = r.feedback ?? r.Feedback ?? undefined;
    const created = r.created ?? r.Created ?? r.date ?? r.Date ?? undefined;
    const reAttemptCount = r.reAttemptCount ?? r.ReAttemptCount ?? 0;
    return {
      ...r,
      id,
      assignmentId,
      moduleId,
      courseId,
      traineeId,
      marksObtained,
      totalMarks,
      status,
      feedback,
      created,
      reAttemptCount,
    };
  }

  normalizeCertificate(c) {
    if (!c) return c;
    const id = c.id ?? c.Id;
    const traineeId = c.traineeId ?? c.TraineeId;
    const courseId = c.courseId ?? c.CourseId;
    const traineeFullName = c.traineeFullName ?? c.TraineeFullName ?? c.traineeName ?? c.TraineeName;
    const courseName = c.courseName ?? c.CourseName ?? c.courseTitle ?? c.CourseTitle;
    const issuedDate = c.issuedDate ?? c.IssuedDate ?? c.issuedOn ?? c.IssuedOn;
    return {
      ...c,
      id,
      traineeId,
      courseId,
      traineeFullName,
      courseName,
      issuedDate,
    };
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

    
      const contentType = response.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.Message || `HTTP error! status: ${response.status}`;
        console.error(`API Error: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // ---------------- AUTH ----------------
  auth = {
    login: (credentials) =>
      this.request(`${this.identityURL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }),

    register: (userData) =>
      this.request(`${this.identityURL}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }),

    // Verify an email exists (basic verification step)
    verifyEmail: (email) =>
      this.request(`${this.identityURL}/Auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: email }),
      }),

    // Reset password after verification step
    resetPassword: ({ email, newPassword }) =>
      this.request(`${this.identityURL}/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, NewPassword: newPassword }),
      }),

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      return Promise.resolve();
    },
  };

  // Admin: Pending user management (requires backend support)
  admin = {
    getPendingUsers: () => this.request(`${this.identityURL}/Auth/pending-users`),
    approveUser: ({ email, role }) =>
      this.request(`${this.identityURL}/Auth/approve-user`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      }),
    rejectUser: ({ email }) =>
      this.request(`${this.identityURL}/Auth/reject-user`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  };

  // ---------------- COURSES ----------------
  courses = {
    getAll: () => this.request(`${this.baseURL}/Course`),
    getById: (id) => this.request(`${this.baseURL}/Course/${id}`),
    create: (data) =>
      this.request(`${this.baseURL}/Course`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.baseURL}/Course/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/Course/${id}`, {
        method: "DELETE",
      }),
  };

  // ---------------- MODULES ----------------
  modules = {
    getAll: () => this.request(`${this.baseURL}/Modules`),
    getById: (id) => this.request(`${this.baseURL}/Modules/${id}`),
    getByCourse: async (courseId) => {
      // Get all modules and filter by course (if API doesn't have specific endpoint)
      try {
        const allModules = await this.request(`${this.baseURL}/Modules`);
        return allModules.filter(module => module.courseId === parseInt(courseId));
      } catch (error) {
        console.error('Failed to fetch modules by course:', error);
        return [];
      }
    },
    create: (data) =>
      this.request(`${this.baseURL}/Modules`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.baseURL}/Modules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/Modules/${id}`, {
        method: "DELETE",
      }),
  };

  // ---------------- ASSIGNMENTS ----------------
  assignments = {
    getAll: () => this.request(`${this.baseURL}/Assignment`),
    getById: (id) => this.request(`${this.baseURL}/Assignment/${id}`),
    getByModule: async (moduleId) => {
      // Get all assignments and filter by module (if API doesn't have specific endpoint)
      try {
        const allAssignments = await this.request(`${this.baseURL}/Assignment`);
        return allAssignments.filter(assignment => assignment.moduleId === parseInt(moduleId));
      } catch (error) {
        console.error('Failed to fetch assignments by module:', error);
        return [];
      }
    },
    create: (data) =>
      this.request(`${this.baseURL}/Assignment`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.baseURL}/Assignment/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/Assignment/${id}`, {
        method: "DELETE",
      }),
  };

  // ---------------- USERS ----------------
  users = {
    getAll: () => this.request(`${this.identityURL}/Auth/all-users`),
    getById: (id) => this.request(`${this.identityURL}/Auth/my-profile`), // Use profile endpoint for now
    create: (data) =>
      this.request(`${this.identityURL}/Auth/register`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.identityURL}/Auth/change-password`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/User/${id}`, { // Keep this for now, might need custom endpoint
        method: "DELETE",
      }),
  };

  // ---------------- ENROLLMENTS ----------------
  enrollments = {
    getAll: async () => {
      const res = await this.request(`${this.baseURL}/Enrollment`);
      return Array.isArray(res) ? res.map(e => this.normalizeEnrollment(e)) : [];
    },
    getById: async (id) => {
      const res = await this.request(`${this.baseURL}/Enrollment/${id}`);
      return this.normalizeEnrollment(res);
    },
    // Helper: filter enrollments for a specific user (trainee)
    getByUser: async (userId) => {
      // Prefer trainee-allowed endpoints if available
      const token = localStorage.getItem("token");
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      // Try GET /Enrollment/my (common pattern)
      try {
        const res = await fetch(`${this.baseURL}/Enrollment/my`, { headers: { ...authHeaders } });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data.map(e => this.normalizeEnrollment(e)) : [];
        }
      } catch (_) { /* ignore and fallback */ }

      // Try GET /Enrollment/trainee/{id}
      try {
        const res = await fetch(`${this.baseURL}/Enrollment/trainee/${encodeURIComponent(userId)}`, { headers: { ...authHeaders } });
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data.map(e => this.normalizeEnrollment(e)) : [];
        }
      } catch (_) { /* ignore and fallback */ }

      // Fallback: Admin-only list-and-filter (may 403 for trainees)
      try {
        const all = await this.request(`${this.baseURL}/Enrollment`);
        const normalized = Array.isArray(all) ? all.map(e => this.normalizeEnrollment(e)) : [];
        return normalized.filter(e => `${e.userId}` === `${userId}`);
      } catch (err) {
        console.error('Failed to get enrollments by user:', err);
        return [];
      }
    },
    // Admin create enrollment
    create: async (data) => {
      const payload = {
        id: data.id ?? 0,
        courseId: data.courseId,
        traineeId: data.traineeId ?? data.userId,
        // Backend sets Created = UtcNow, but accept client field if provided
        enrolled: data.enrolled ?? data.enrollmentDate ?? undefined,
        statuses: data.statuses ?? data.status ?? 'Active',
      };
      const res = await this.request(`${this.baseURL}/Enrollment`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return this.normalizeEnrollment(res);
    },
    // Admin update enrollment
    update: async (id, data) => {
      const payload = {
        id,
        courseId: data.courseId,
        traineeId: data.traineeId ?? data.userId,
        enrolled: data.enrolled ?? data.enrollmentDate ?? undefined,
        statuses: data.statuses ?? data.status ?? 'Active',
      };
      const res = await this.request(`${this.baseURL}/Enrollment/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return this.normalizeEnrollment(res);
    },
    delete: (id) =>
      this.request(`${this.baseURL}/Enrollment/${id}`, {
        method: "DELETE",
      }),
    // Mark enrollment as completed
    complete: (id) =>
      this.request(`${this.baseURL}/Enrollment/${id}/complete`, {
        method: "POST",
      }),
   
    enroll: async ({ userId, courseId, status, statuses, enrollmentDate, enrolled }) => {
      return this.enrollments.create({
        userId,
        traineeId: userId,
        courseId,
        status: status ?? statuses ?? 'Active',
        enrollmentDate: enrollmentDate ?? enrolled ?? new Date().toISOString(),
      });
    },
  };

  // ---------------- RESULTS (using Marks endpoint) ----------------
  results = {
    // Admin: get all results
    getAll: async () => {
      const data = await this.request(`${this.baseURL}/Result/all`);
      return Array.isArray(data) ? data.map(r => this.normalizeResult(r)) : [];
    },
    // Trainee: get own results
    getMine: async () => {
      const data = await this.request(`${this.baseURL}/Result/my-results`);
      return Array.isArray(data) ? data.map(r => this.normalizeResult(r)) : [];
    },
    // Add/submission: choose endpoint by role
    add: (data, passWeightage) => {
      const role = (localStorage.getItem("role") || "").toLowerCase();
      const path = role === "trainee" ? "submit" : "add";
      const defaultFeedback = role === "trainee" ? "Auto-graded submission" : "Reviewed by admin";
      const feedback = (typeof data.feedback === 'string' && data.feedback.trim().length > 0) ? data.feedback : defaultFeedback;
      const payload = { ...data, feedback };
      return this.request(`${this.baseURL}/Result/${path}?passWeightage=${encodeURIComponent(passWeightage ?? 0)}`, {
        method: "POST",
        body: JSON.stringify(payload),
      }).then(res => this.normalizeResult(res));
    },
  };

  // ---------------- CERTIFICATES ----------------
  certificates = {
    getAll: () => {
      // No general getAll endpoint available, return empty array for now
      return Promise.resolve([]);
    },
    // Prevent UI breakage where getByUser is referenced
    getByUser: (userId) => Promise.resolve([]),
    getById: async (id) => {
      const data = await this.request(`${this.baseURL}/Certificate/view/${id}`);
      return this.normalizeCertificate(data);
    },
    // Download with auth and return Blob
    download: async (id) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${this.baseURL}/Certificate/download/${id}`, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to download certificate: ${res.status}`);
      }
      return await res.blob();
    },
    create: async (data) => {
      const payload = { traineeId: data.traineeId, courseId: data.courseId };
      const res = await this.request(`${this.baseURL}/Certificate/generate`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return this.normalizeCertificate(res);
    },
    update: (id, data) => {
      // No certificate update endpoint visible in API
      return Promise.reject(new Error('Certificate update not available'));
    },
    delete: (id) => {
      // No certificate delete endpoint visible in API  
      return Promise.reject(new Error('Certificate deletion not available'));
    },
  };

  // ---------------- QUESTIONS (placeholder) ----------------
  // ---------------- QUESTIONS ----------------
  questions = {
    // GET /api/Questions
    getAll: async () => {
      const data = await this.request(`${this.baseURL}/Questions`);
      return Array.isArray(data) ? data.map(q => this.normalizeQuestion(q)) : [];
    },

    // GET /api/Questions/{id}
    getById: async (id) => {
      const q = await this.request(`${this.baseURL}/Questions/${id}`);
      return this.normalizeQuestion(q);
    },

    // Convenience helper: fetch all and filter by assignmentId
    getByAssignment: async (assignmentId) => {
      try {
        const all = await this.request(`${this.baseURL}/Questions`);
        const normalized = Array.isArray(all) ? all.map(q => this.normalizeQuestion(q)) : [];
        return normalized.filter(q => q.assignmentId === parseInt(assignmentId));
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        return [];
      }
    },

    // POST /api/Questions
    // Accepts either shape with `content` or backend shape with `contentJson`
    create: async (data) => {
      const payload = {
        id: data.id ?? 0,
        assignmentId: data.assignmentId,
        moduleId: data.moduleId,
        contentJson: data.contentJson ?? data.content,
        correctAnswer: data.correctAnswer,
      };
      const res = await this.request(`${this.baseURL}/Questions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return this.normalizeQuestion(res);
    },

    // PUT /api/Questions/{id}
    update: async (id, data) => {
      const payload = {
        id: id,
        assignmentId: data.assignmentId,
        moduleId: data.moduleId,
        contentJson: data.contentJson ?? data.content,
        correctAnswer: data.correctAnswer,
      };
      const res = await this.request(`${this.baseURL}/Questions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return this.normalizeQuestion(res);
    },

    // DELETE /api/Questions/{id}
    delete: (id) =>
      this.request(`${this.baseURL}/Questions/${id}`, {
        method: "DELETE",
      }),
  };
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
