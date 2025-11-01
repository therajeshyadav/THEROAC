const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Base request function
const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        signal: controller.signal,
        ...options,
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId); // Clear timeout on successful response
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error('API Error:', error);
        
        // Handle timeout and network errors gracefully
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
        }
        throw error;
    }
};

// Auth endpoints
const login = async (credentials) => {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

const register = async (userData) => {
    return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

const getCurrentUser = async () => {
    return request('/auth/me');
};

const forgotPassword = async (email) => {
    return request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(email),
    });
};

const resetPassword = async (resetData) => {
    return request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData),
    });
};

const verifyEmail = async (token) => {
    return request(`/auth/verify-email?token=${token}`);
};

const resendVerification = async (email) => {
    return request('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(email),
    });
};

// Jobs endpoints
const getJobs = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return request(`/jobs${queryParams ? `?${queryParams}` : ''}`);
};

const getJobById = async (id) => {
    return request(`/jobs/${id}`);
};

const createJob = async (jobData) => {
    return request('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
    });
};

const applyToJob = async (jobId, applicationData) => {
    return request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
    });
};

const getUserApplications = async () => {
    return request('/jobs/applications');
};

// Events endpoints
const getEvents = async () => {
    return request('/events');
};

const createEvent = async (eventData) => {
    return request('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
};

const registerForEvent = async (eventId) => {
    return request(`/events/${eventId}/register`, {
        method: 'POST',
    });
};

// Hackathons endpoints
const getHackathons = async () => {
    return request('/hackathons');
};

const registerForHackathon = async (hackathonId, teamData) => {
    return request(`/hackathons/${hackathonId}/register`, {
        method: 'POST',
        body: JSON.stringify(teamData),
    });
};

// User profile endpoints
const getProfile = async () => {
    return request('/users/me');
};

const updateProfile = async (profileData) => {
    return request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

// Dashboard endpoints
const getCandidateStats = async () => {
    return request('/dashboard/candidate/stats');
};

// Admin endpoints
const getAdminStats = async () => {
    return request('/admin/dashboard/stats');
};

const getAdminUsers = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
};

const updateUserStatus = async (userId, status) => {
    return request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

const getAdminJobs = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/admin/jobs${queryParams ? `?${queryParams}` : ''}`);
};

const getAdminEvents = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/admin/events${queryParams ? `?${queryParams}` : ''}`);
};

const getAdminAnalytics = async () => {
    return request('/admin/analytics');
};

// Hub Content endpoints
const createHubContent = async (contentData) => {
    return request('/events', {
        method: 'POST',
        body: JSON.stringify({
            ...contentData,
            eventType: 'hub-content'
        }),
    });
};

const getHubContent = async (filters = {}) => {
    const queryParams = new URLSearchParams({
        ...filters,
        eventType: 'hub-content'
    }).toString();
    return request(`/events${queryParams ? `?${queryParams}` : ''}`);
};

// Export all functions as apiService object
const apiService = {
    request,
    login,
    register,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getJobs,
    getJobById,
    createJob,
    applyToJob,
    getUserApplications,
    getEvents,
    createEvent,
    registerForEvent,
    getHackathons,
    registerForHackathon,
    getProfile,
    updateProfile,
    getCandidateStats,
    getAdminStats,
    getAdminUsers,
    updateUserStatus,
    getAdminJobs,
    getAdminEvents,
    getAdminAnalytics,
    createHubContent,
    getHubContent
};

export default apiService;