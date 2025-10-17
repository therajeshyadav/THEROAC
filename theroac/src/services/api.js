const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Jobs endpoints
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/jobs${queryParams ? `?${queryParams}` : ''}`);
  }

  async getJobById(id) {
    return this.request(`/jobs/${id}`);
  }

  async applyToJob(jobId, applicationData) {
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getUserApplications() {
    return this.request('/jobs/applications');
  }

  // Events endpoints
  async getEvents() {
    return this.request('/events');
  }

  async registerForEvent(eventId) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
    });
  }

  // Hackathons endpoints
  async getHackathons() {
    return this.request('/hackathons');
  }

  async registerForHackathon(hackathonId, teamData) {
    return this.request(`/hackathons/${hackathonId}/register`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  // User profile endpoints
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

const apiService = new ApiService();
export default apiService;