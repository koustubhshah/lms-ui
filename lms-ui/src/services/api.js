// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:5284/api", // Main LMS API
  IDENTITY_URL: "http://localhost:5210/api/Identity", // Identity Service
  TIMEOUT: 10000,
};

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.identityURL = API_CONFIG.IDENTITY_URL;
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

      // Check if response has content
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

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      return Promise.resolve();
    },
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
    getAll: () => this.request(`${this.baseURL}/Enrollment`),
    getById: (id) => this.request(`${this.baseURL}/Enrollment/${id}`),
    create: (data) =>
      this.request(`${this.baseURL}/Enrollment`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.baseURL}/Enrollment/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/Enrollment/${id}`, {
        method: "DELETE",
      }),
  };

  // ---------------- RESULTS (using Marks endpoint) ----------------
  results = {
    getAll: () => this.request(`${this.baseURL}/Marks`),
    getById: (id) => this.request(`${this.baseURL}/Marks/${id}`),
    create: (data) =>
      this.request(`${this.baseURL}/Marks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      this.request(`${this.baseURL}/Marks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      this.request(`${this.baseURL}/Marks/${id}`, {
        method: "DELETE",
      }),
  };

  // ---------------- CERTIFICATES ----------------
  certificates = {
    getAll: () => {
      // No general getAll endpoint available, return empty array for now
      return Promise.resolve([]);
    },
    getById: (id) => this.request(`${this.baseURL}/Certificate/view/${id}`),
    download: (id) => this.request(`${this.baseURL}/Certificate/download/${id}`),
    create: (data) => {
      // No certificate creation endpoint visible in API
      return Promise.reject(new Error('Certificate creation not available'));
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
  questions = {
    getAll: () => {
      // No questions endpoint found in API, return empty array
      return Promise.resolve([]);
    },
    getById: (id) => {
      // No questions endpoint found in API
      return Promise.resolve(null);
    },
    getByAssignment: async (assignmentId) => {
      // No questions endpoint found in API, return empty array for now
      return Promise.resolve([]);
    },
    create: (data) => {
      // No questions endpoint found in API
      return Promise.reject(new Error('Questions not available in API'));
    },
    update: (id, data) => {
      // No questions endpoint found in API
      return Promise.reject(new Error('Questions not available in API'));
    },
    delete: (id) => {
      // No questions endpoint found in API
      return Promise.reject(new Error('Questions not available in API'));
    },
  };
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
