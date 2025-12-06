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

const getJobBySlug = async (slug) => {
    return request(`/jobs/slug/${slug}`);
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

const getRecruiterApplications = async () => {
    return request('/jobs/recruiter/applications');
};

const updateApplicationStatus = async (applicationId, data) => {
    return request(`/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const updateApplicationNotes = async (applicationId, data) => {
    return request(`/jobs/applications/${applicationId}/notes`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Events endpoints
const getEvents = async () => {
    return request('/events');
};

const getEventById = async (id) => {
    return request(`/events/${id}`);
};

const getEventBySlug = async (slug) => {
    return request(`/events/slug/${slug}`);
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

// Hub Content endpoints
const applyToHubContent = async (hubContentId) => {
    return request(`/hub-content/${hubContentId}/apply`, {
        method: 'POST',
    });
};

// Bookmark endpoints
const toggleBookmark = async (itemId, itemType) => {
    return request('/bookmarks/toggle', {
        method: 'POST',
        body: JSON.stringify({ itemId, itemType }),
    });
};

const checkBookmarkStatus = async (itemId, itemType) => {
    return request(`/bookmarks/status/${itemType}/${itemId}`);
};

const getMyBookmarks = async () => {
    return request('/bookmarks/my-bookmarks');
};

// Like endpoints
const toggleLike = async (itemId, itemType) => {
    return request('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({ itemId, itemType }),
    });
};

const checkLikeStatus = async (itemId, itemType) => {
    return request(`/likes/status/${itemType}/${itemId}`);
};

const getMyLikes = async () => {
    return request('/likes/my-likes');
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

const uploadResume = async (formData) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/users/upload-resume`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData, // Don't set Content-Type, let browser set it with boundary
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Resume upload failed');
    }
    
    return data;
};

// Dashboard endpoints
const getCandidateStats = async () => {
    return request('/candidate-dashboard/stats');
};

const getJobRecommendations = async (limit = 10) => {
    return request(`/candidate-dashboard/recommendations?limit=${limit}`);
};

const getApplicationAnalytics = async (period = 30) => {
    return request(`/candidate-dashboard/analytics?period=${period}`);
};

// Saved Jobs endpoints
const toggleSaveJob = async (jobId, jobType = 'job', collection = 'default') => {
    return request('/saved-jobs/toggle', {
        method: 'POST',
        body: JSON.stringify({ jobId, jobType, collection }),
    });
};

const getSavedJobs = async (collection = null) => {
    const query = collection ? `?collection=${collection}` : '';
    return request(`/saved-jobs${query}`);
};

const checkSavedStatus = async (jobId, jobType = 'job') => {
    return request(`/saved-jobs/status/${jobType}/${jobId}`);
};

const updateSavedJob = async (id, data) => {
    return request(`/saved-jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const getCollections = async () => {
    return request('/saved-jobs/collections');
};

// Interview endpoints
const getCandidateInterviews = async (upcoming = false) => {
    const query = upcoming ? '?upcoming=true' : '';
    return request(`/interviews/candidate${query}`);
};

const scheduleInterview = async (interviewData) => {
    return request('/interviews/schedule', {
        method: 'POST',
        body: JSON.stringify(interviewData),
    });
};

const updateInterviewStatus = async (id, data) => {
    return request(`/interviews/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const rescheduleInterview = async (id, data) => {
    return request(`/interviews/${id}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Resume endpoints
const uploadResumeMultiple = async (formData) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/resumes/upload`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Resume upload failed');
    }
    
    return data;
};

const getResumes = async () => {
    return request('/resumes');
};

const setDefaultResume = async (id) => {
    return request(`/resumes/${id}/default`, {
        method: 'PUT',
    });
};

const updateResumeTitle = async (id, title) => {
    return request(`/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title }),
    });
};

const deleteResume = async (id) => {
    return request(`/resumes/${id}`, {
        method: 'DELETE',
    });
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
    return request('/hub-content', {
        method: 'POST',
        body: JSON.stringify(contentData),
    });
};

const getHubContent = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return request(`/hub-content${queryParams ? `?${queryParams}` : ''}`);
};

const getHubContentById = async (id) => {
    return request(`/hub-content/${id}`);
};

const getHubContentBySlug = async (slug) => {
    return request(`/hub-content/slug/${slug}`);
};

// Application status check endpoints
const checkJobApplicationStatus = async (jobId) => {
    return request(`/jobs/${jobId}/application-status`);
};

const checkEventRegistrationStatus = async (eventId) => {
    return request(`/events/${eventId}/registration-status`);
};

const checkHubContentApplicationStatus = async (hubContentId) => {
    return request(`/hub-content/${hubContentId}/application-status`);
};

const getUserApplicationStatuses = async (itemIds = []) => {
    const queryParams = new URLSearchParams({ ids: itemIds.join(',') }).toString();
    return request(`/applications/status${queryParams ? `?${queryParams}` : ''}`);
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
    getJobBySlug,
    createJob,
    applyToJob,
    getUserApplications,
    getRecruiterApplications,
    updateApplicationStatus,
    updateApplicationNotes,
    getEvents,
    getEventById,
    getEventBySlug,
    createEvent,
    registerForEvent,
    applyToHubContent,
    getHackathons,
    registerForHackathon,
    getProfile,
    updateProfile,
    uploadResume,
    getCandidateStats,
    getJobRecommendations,
    getApplicationAnalytics,
    getAdminStats,
    getAdminUsers,
    updateUserStatus,
    getAdminJobs,
    getAdminEvents,
    getAdminAnalytics,
    createHubContent,
    getHubContent,
    getHubContentById,
    getHubContentBySlug,
    checkJobApplicationStatus,
    checkEventRegistrationStatus,
    checkHubContentApplicationStatus,
    getUserApplicationStatuses,
    toggleBookmark,
    checkBookmarkStatus,
    getMyBookmarks,
    toggleLike,
    checkLikeStatus,
    getMyLikes,
    toggleSaveJob,
    getSavedJobs,
    checkSavedStatus,
    updateSavedJob,
    getCollections,
    getCandidateInterviews,
    scheduleInterview,
    updateInterviewStatus,
    rescheduleInterview,
    uploadResumeMultiple,
    getResumes,
    setDefaultResume,
    updateResumeTitle,
    deleteResume
};

export default apiService;