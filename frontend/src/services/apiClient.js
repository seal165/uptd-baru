/**
 * Centralized API Client untuk komunikasi ke backend.
 * SEMUA call ke backend lewat sini. Pakai URL endpoint BARU (clean RESTful).
 *
 * Kalau backend diganti / URL endpoint berubah, cukup edit di file ini saja.
 */
const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

// Axios instance dengan default config
const http = axios.create({
    baseURL: env.API_URL, // e.g. http://localhost:5000/api
    timeout: 15000,
    headers: { Accept: 'application/json' }
});

// Interceptor untuk log error
http.interceptors.response.use(
    (response) => response,
    (error) => {
        const detail = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        };
        logger.warn('API call failed: ' + JSON.stringify(detail));
        return Promise.reject(error);
    }
);

// Helper untuk auth header
const withAuth = (token) =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {};

// =========== AUTH ===========
exports.auth = {
    login: (email, password) => http.post('/auth/login', { email, password }),
    adminLogin: (email, password) => http.post('/auth/admin/login', { email, password }),
    register: (data) => http.post('/auth/register', data),
    changePassword: (token, data) =>
        http.post('/auth/change-password', data, withAuth(token)),
    refresh: (refreshToken) => http.post('/auth/refresh', { refreshToken })
};

// =========== PUBLIC ===========
exports.public = {
    getServices: () => http.get('/public/services'),
    getServiceById: (id) => http.get(`/public/services/${id}`),
    getJadwalSibuk: () => http.get('/public/jadwal-sibuk'),
    getBusySchedule: () => http.get('/public/busy-schedule')
};

// =========== USER PROFILE ===========
exports.user = {
    getProfile: (token) => http.get('/users/profile/me', withAuth(token)),
    updateProfile: (token, data) => http.put('/users/profile/me', data, withAuth(token)),
    uploadAvatar: (token, formData) =>
        http.post('/users/profile/avatar', formData, {
            headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
        }),
    deleteAvatar: (token) => http.delete('/users/profile/avatar', withAuth(token)),

    // Admin
    list: (token, params) => http.get('/users', { ...withAuth(token), params }),
    detail: (token, id) => http.get(`/users/${id}/detail`, withAuth(token)),
    update: (token, id, data) => http.put(`/users/${id}`, data, withAuth(token)),
    delete: (token, id) => http.delete(`/users/${id}`, withAuth(token)),
    verify: (token, id) => http.post(`/users/${id}/verify`, {}, withAuth(token)),
    resetPassword: (token, id) =>
        http.post(`/users/${id}/reset-password`, {}, withAuth(token)),
    sendNotification: (token, id, data) =>
        http.post(`/users/${id}/notify`, data, withAuth(token))
};

// =========== SUBMISSION ===========
exports.submission = {
    // Admin
    list: (token, params) => http.get('/submissions', { ...withAuth(token), params }),
    detail: (token, id) => http.get(`/submissions/${id}`, withAuth(token)),
    update: (token, id, data) => http.put(`/submissions/${id}`, data, withAuth(token)),
    cancel: (token, id) => http.post(`/submissions/${id}/cancel`, {}, withAuth(token)),
    getDocuments: (token, id) =>
        http.get(`/submissions/${id}/documents`, withAuth(token)),

    // User
    create: (token, formData) =>
        http.post('/submissions', formData, {
            headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }),
    userHistory: (token, params) =>
        http.get('/submissions/user/history', { ...withAuth(token), params }),
    userHistoryDetail: (token, id) =>
        http.get(`/submissions/user/history/${id}`, withAuth(token)),
    userDashboard: (token) => http.get('/submissions/user/dashboard', withAuth(token))
};

// =========== SKRD / PAYMENT ===========
exports.skrd = {
    list: (token, params) => http.get('/skrd', { ...withAuth(token), params }),
    detail: (token, id) => http.get(`/skrd/${id}`, withAuth(token)),
    create: (token, data) => http.post('/skrd', data, withAuth(token)),
    updateStatus: (token, id, data) =>
        http.put(`/skrd/${id}/status`, data, withAuth(token)),
    uploadFile: (token, id, formData) =>
        http.post(`/skrd/${id}/upload-skrd`, formData, {
            headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
        }),
    downloadFile: (token, id) =>
        http.get(`/skrd/${id}/download-skrd`, { ...withAuth(token), responseType: 'stream' }),
    uploadPaymentProof: (token, id, formData) =>
        http.post(`/skrd/${id}/upload-payment-proof`, formData, {
            headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
        }),
    verifyPayment: (token, id) =>
        http.post(`/skrd/${id}/verify-payment`, {}, withAuth(token)),
    rejectProof: (token, id, data) =>
        http.post(`/skrd/${id}/reject-proof`, data, withAuth(token)),
    sendReminder: (token, id) =>
        http.post(`/skrd/${id}/remind`, {}, withAuth(token))
};

// =========== TRANSACTION (alias dari payment dari sisi user) ===========
exports.transaction = {
    userList: (token, params) => http.get('/transactions/user', { ...withAuth(token), params }),
    userDetail: (token, id) => http.get(`/transactions/user/${id}`, withAuth(token))
};

// =========== KUISIONER ===========
exports.kuisioner = {
    publicQuestions: () => http.get('/kuisioner/public/questions'),
    publicSubmit: (data) => http.post('/kuisioner/public/submit', data),
    check: (token, submissionId) =>
        token
            ? http.get(`/kuisioner/check/${submissionId}`, withAuth(token))
            : http.get(`/kuisioner/check/${submissionId}`),

    // Admin
    list: (token, params) => http.get('/kuisioner', { ...withAuth(token), params }),
    detail: (token, id) => http.get(`/kuisioner/${id}`, withAuth(token)),
    stats: (token) => http.get('/kuisioner/stats', withAuth(token)),

    listQuestions: (token) => http.get('/kuisioner/questions', withAuth(token)),
    createQuestion: (token, data) => http.post('/kuisioner/questions', data, withAuth(token)),
    updateQuestion: (token, id, data) =>
        http.put(`/kuisioner/questions/${id}`, data, withAuth(token)),
    deleteQuestion: (token, id) =>
        http.delete(`/kuisioner/questions/${id}`, withAuth(token)),
    reorderQuestions: (token, data) =>
        http.post('/kuisioner/questions/reorder', data, withAuth(token))
};

// =========== NOTIFICATION ===========
exports.notification = {
    // Admin
    adminList: (token, params) =>
        http.get('/notifications/admin', { ...withAuth(token), params }),
    markAllAdminRead: (token) =>
        http.put('/notifications/admin/mark-all-read', {}, withAuth(token)),

    // User
    userList: (token, params) =>
        http.get('/notifications/user', { ...withAuth(token), params }),
    unreadCount: (token) => http.get('/notifications/user/count', withAuth(token)),
    getSettings: (token) => http.get('/notifications/user/settings', withAuth(token)),
    updateSettings: (token, data) =>
        http.put('/notifications/user/settings', data, withAuth(token))
};

// =========== SETTING ===========
exports.setting = {
    getSystem: (token) => http.get('/settings/system', withAuth(token)),
    updateSystem: (token, data) => http.put('/settings/system', data, withAuth(token)),
    getProfile: (token) => http.get('/settings/profile', withAuth(token)),
    getBusyMode: (token) => http.get('/settings/busy-mode', withAuth(token)),
    updateBusyMode: (token, data) =>
        http.put('/settings/busy-mode', data, withAuth(token)),
    addBusyPeriod: (token, data) =>
        http.post('/settings/busy-mode/periods', data, withAuth(token)),
    deleteBusyPeriod: (token, id) =>
        http.delete(`/settings/busy-mode/periods/${id}`, withAuth(token)),
    activityLogs: (token, params) =>
        http.get('/settings/logs', { ...withAuth(token), params })
};

// =========== REPORT ===========
exports.report = {
    list: (token, params) => http.get('/reports', { ...withAuth(token), params }),
    uploadSubmissionReport: (token, submissionId, formData) =>
        http.post(`/reports/submissions/${submissionId}`, formData, {
            headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() }
        }),
    downloadSubmissionReport: (token, submissionId) =>
        http.get(`/reports/submissions/${submissionId}`, {
            ...withAuth(token),
            responseType: 'stream'
        })
};

// =========== DASHBOARD ===========
exports.dashboard = {
    adminStats: (token) => http.get('/dashboard/admin/stats', withAuth(token)),
    getData: (token) => http.get('/dashboard/complete', withAuth(token))
};

// =========== FILE (akses file di backend, auth + ownership) ===========
exports.file = {
    get: (token, fileType, filename) =>
        http.get(`/files/${fileType}/${filename}`, {
            ...withAuth(token),
            responseType: 'stream'
        })
};
