const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Base request function with retry logic
const request = async (endpoint, options = {}, retryCount = 0) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    // Create timeout controller - longer timeout for admin endpoints
    const controller = new AbortController();
    const isAdminEndpoint = endpoint.startsWith('/admin');
    const timeoutDuration = isAdminEndpoint ? 45000 : 20000; // 45s for admin, 20s for others
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

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
            // Check if user is banned
            if (response.status === 403 && data.isBanned) {
                // Clear user data and redirect to banned screen
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Trigger a custom event to notify the app about ban
                window.dispatchEvent(new CustomEvent('userBanned', {
                    detail: {
                        supportEmail: data.supportEmail,
                        supportPhone: data.supportPhone
                    }
                }));
                
                throw new Error(data.error || 'Account banned');
            }
            
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        
        // Handle timeout and network errors gracefully
        if (error.name === 'AbortError') {
            // Retry logic for admin endpoints on timeout
            if (isAdminEndpoint && retryCount < 2) {
                console.log(`Retrying admin request (attempt ${retryCount + 1}):`, endpoint);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
                return request(endpoint, options, retryCount + 1);
            }
            throw new Error('Request timeout - the server is taking longer than expected. Please try again.');
        }
        
        // Retry on network errors for admin endpoints
        if (isAdminEndpoint && retryCount < 1 && (error.message.includes('fetch') || error.message.includes('network'))) {
            console.log(`Retrying admin request due to network error (attempt ${retryCount + 1}):`, endpoint);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return request(endpoint, options, retryCount + 1);
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

const getAdminSettings = async () => {
    return request('/admin/settings');
};

const updateAdminSettings = async (settings) => {
    return request('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
};

// Pending Approvals endpoints
const getPendingApprovals = async () => {
    return request('/admin/pending-approvals');
};

// Rejected Items endpoints
const getRejectedItems = async (type = null, userId = null) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (userId) params.append('userId', userId);
    
    const queryString = params.toString();
    return request(`/admin/rejected-items${queryString ? `?${queryString}` : ''}`);
};

const allowResubmission = async (type, itemId, clearRejectionReason = true) => {
    return request(`/admin/rejected-items/${type}/${itemId}/allow-resubmission`, {
        method: 'PUT',
        body: JSON.stringify({ clearRejectionReason })
    });
};

const approveJob = async (jobId, data = {}) => {
    return request(`/admin/jobs/${jobId}/approve`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const approveEvent = async (eventId, data = {}) => {
    return request(`/admin/events/${eventId}/approve`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const rejectJob = async (jobId, data = {}) => {
    return request(`/admin/jobs/${jobId}/reject`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const rejectEvent = async (eventId, data = {}) => {
    return request(`/admin/events/${eventId}/reject`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

const getAdminNotifications = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/admin/notifications${queryParams ? `?${queryParams}` : ''}`);
};

const markNotificationAsRead = async (notificationId) => {
    return request(`/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
    });
};

// Regular user notifications
const getNotifications = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/notifications${queryParams ? `?${queryParams}` : ''}`);
};

const markUserNotificationAsRead = async (notificationId) => {
    return request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
    });
};

const markAllNotificationsAsRead = async () => {
    return request('/notifications/mark-all-read', {
        method: 'PUT',
    });
};

const markAllAdminNotificationsAsRead = async () => {
    return request('/admin/notifications/mark-all-read', {
        method: 'PUT',
    });
};

// Review endpoints
const getReviews = async (itemId, itemType) => {
    return request(`/reviews/${itemType}/${itemId}`);
};

const createReview = async (itemId, itemType, reviewData) => {
    return request(`/reviews/${itemType}/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
    });
};

const updateJobStatus = async (jobId, status) => {
    return request(`/admin/jobs/${jobId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

const deleteJobAdmin = async (jobId) => {
    return request(`/admin/jobs/${jobId}`, {
        method: 'DELETE',
    });
};

const updateEventStatus = async (eventId, status) => {
    return request(`/admin/events/${eventId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

const deleteEventAdmin = async (eventId) => {
    return request(`/admin/events/${eventId}`, {
        method: 'DELETE',
    });
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

const getROACPrimeHubStatus = async () => {
    return request('/hub-content/roac-prime-hub/status');
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
    getAdminNotifications,
    markNotificationAsRead,
    getNotifications,
    markUserNotificationAsRead,
    markAllNotificationsAsRead,
    createHubContent,
    getHubContent,
    getHubContentById,
    getHubContentBySlug,
    getROACPrimeHubStatus,
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
    deleteResume,
    updateJobStatus,
    deleteJobAdmin,
    updateEventStatus,
    getRejectedItems,
    allowResubmission,
    deleteEventAdmin,
    getAdminSettings,
    updateAdminSettings,
    getPendingApprovals,
    approveJob,
    approveEvent,
    rejectJob,
    rejectEvent,
    markAllAdminNotificationsAsRead,
    getReviews,
    createReview
};

export default apiService;