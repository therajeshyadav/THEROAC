const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class DashboardService {
  async getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async fetchWithAuth(url, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getOrganizerStats() {
    return this.fetchWithAuth('/dashboard/stats');
  }

  async getCandidates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchWithAuth(`/dashboard/candidates?${queryString}`);
  }

  async getAnalytics(period = 'year') {
    return this.fetchWithAuth(`/dashboard/analytics?period=${period}`);
  }

  async getEvents() {
    return this.fetchWithAuth('/dashboard/events');
  }
}

export default new DashboardService();