import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url === '/auth/login';
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Branches =====
export const getBranches = () => api.get('/branches').then(r => r.data);
export const createBranch = (data) => api.post('/branches', data).then(r => r.data);

// ===== Employees =====
export const getEmployees = (params = {}) => api.get('/employees', { params }).then(r => r.data);
export const getEmployee = (id) => api.get(`/employees/${id}`).then(r => r.data);
export const createEmployee = (data) => api.post('/employees', data).then(r => r.data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data).then(r => r.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then(r => r.data);

// ===== Payroll =====
export const getPayroll = (period) => api.get('/payroll', { params: { period } }).then(r => r.data);
export const calculatePayroll = (period) => api.post('/payroll/calculate', { period }).then(r => r.data);
export const updateDeductions = (id, otherDeductions) => api.put(`/payroll/${id}/deductions`, { otherDeductions }).then(r => r.data);
export const updateSalesBonus = (id, salesBonus) => api.put(`/payroll/${id}/sales-bonus`, { salesBonus }).then(r => r.data);
export const getPayrollPeriods = () => api.get('/payroll/periods').then(r => r.data);

// ===== Student Courses =====
export const getStudentCourses = (params = {}) => api.get('/student-courses', { params }).then(r => r.data);
export const getStudentCourse = (id) => api.get(`/student-courses/${id}`).then(r => r.data);
export const getStudentCourseHistory = (id) => api.get(`/student-courses/${id}/history`).then(r => r.data);
export const createStudentCourse = (data) => api.post('/student-courses', data).then(r => r.data);
export const updateStudentCourse = (id, data) => api.put(`/student-courses/${id}`, data).then(r => r.data);
export const deleteStudentCourse = (id) => api.delete(`/student-courses/${id}`).then(r => r.data);

// ===== Lesson Records =====
export const addLesson = (courseId, data) => api.post(`/student-courses/${courseId}/lessons`, data).then(r => r.data);
export const createTestLesson = (data) => api.post('/student-courses/test-lesson', data).then(r => r.data);
export const updateLesson = (courseId, lessonId, data) => api.put(`/student-courses/${courseId}/lessons/${lessonId}`, data).then(r => r.data);
export const deleteLesson = (courseId, lessonId) => api.delete(`/student-courses/${courseId}/lessons/${lessonId}`).then(r => r.data);

// ===== Schedule =====
export const getSchedule = (month, branch) => api.get('/schedule', { params: { month, branch } }).then(r => r.data);
export const getDailySchedule = (date, branch) => api.get('/schedule/daily', { params: { date, branch } }).then(r => r.data);
export const getScheduleRange = (startDate, endDate, branch) => api.get('/schedule/range', { params: { startDate, endDate, branch } }).then(r => r.data);

export const getCommissionDetails = (coachId, period) => api.get('/payroll/commission-details', { params: { coachId, period } }).then(r => r.data);
export const getCommissionSummary = (period, coachId) => api.get('/payroll/commission-summary', { params: { period, ...(coachId && { coachId }) } }).then(r => r.data);

export default api;
