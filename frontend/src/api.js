// src/utils/api.js - Configuración centralizada de API

import axios from 'axios';

// Configuración base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Crear instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para requests (agregar logs)
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses (manejo global de errores)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    
    // Manejo global de errores comunes
    if (error.response?.status === 401) {
      console.warn('🔐 Sesión expirada - redirigiendo al login');
      // Limpiar localStorage y redirigir
      localStorage.removeItem('rememberedUser');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Funciones de API organizadas por módulo
export const authAPI = {
  // Login
  login: (credentials) => api.post('/login', credentials),
  
  // Verificar conexión
  testConnection: () => api.get('/test-data'),
};

export const userAPI = {
  // Obtener todos los usuarios
  getAll: () => api.get('/users'),
  
  // Obtener usuario por ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Crear usuario
  create: (userData) => api.post('/users', userData),
  
  // Actualizar usuario
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Eliminar usuario
  delete: (id) => api.delete(`/users/${id}`),
  
  // Subir foto de perfil
  uploadPhoto: (id, formData) => api.post(`/users/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Obtener psicólogos
  getPsychologists: () => api.get('/psicologos'),
  
  // Obtener pacientes
  getPatients: () => api.get('/pacientes'),
};

export const appointmentAPI = {
  // Obtener todas las citas
  getAll: () => api.get('/appointments'),
  
  // Obtener citas por paciente
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  
  // Obtener citas por psicólogo
  getByPsychologist: (psychologistId) => api.get(`/appointments/psychologist/${psychologistId}`),
  
  // Crear cita
  create: (appointmentData) => api.post('/appointments', appointmentData),
  
  // Actualizar cita
  update: (id, updates) => api.put(`/appointments/${id}`, updates),
  
  // Marcar como pagada
  markAsPaid: (id) => api.put(`/appointments/${id}/pay`),
  
  // Eliminar cita
  delete: (id) => api.delete(`/appointments/${id}`),
  
  // Buscar citas con filtros
  search: (filters) => api.get('/appointments/search', { params: filters }),
};

export const paymentAPI = {
  // Obtener todos los pagos
  getAll: () => api.get('/payments'),
  
  // Obtener pagos por paciente
  getByPatient: (patientId) => api.get(`/payments/patient/${patientId}`),
  
  // Obtener pagos por psicólogo
  getByPsychologist: (psychologistId) => api.get(`/payments/psychologist/${psychologistId}`),
  
  // Crear pago
  create: (paymentData) => api.post('/payments', paymentData),
  
  // Actualizar pago
  update: (id, updates) => api.put(`/payments/${id}`, updates),
  
  // Obtener pagos pendientes
  getPending: () => api.get('/payments/pending'),
};

export const clinicalNoteAPI = {
  // Obtener todas las notas
  getAll: () => api.get('/clinical-notes'),
  
  // Obtener notas por paciente
  getByPatient: (patientId) => api.get(`/clinical-notes/patient/${patientId}`),
  
  // Obtener notas por psicólogo
  getByPsychologist: (psychologistId) => api.get(`/clinical-notes/psychologist/${psychologistId}`),
  
  // Obtener notas por cita
  getByAppointment: (appointmentId) => api.get(`/clinical-notes/appointment/${appointmentId}`),
  
  // Crear nota clínica
  create: (noteData) => api.post('/clinical-notes', noteData),
  
  // Actualizar nota
  update: (id, updates) => api.put(`/clinical-notes/${id}`, updates),
  
  // Eliminar nota
  delete: (id) => api.delete(`/clinical-notes/${id}`),
};

export const reportsAPI = {
  // Reportes generales (admin)
  getGeneral: () => api.get('/reports'),
  
  // Reportes detallados
  getDetailed: () => api.get('/reports/detailed'),
  
  // Reportes por psicólogo
  getByPsychologist: (psychologistId) => api.get(`/reports/psychologist/${psychologistId}`),
  
  // Reportes por paciente
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  
  // Historial completo del paciente
  getPatientHistory: (patientId) => api.get(`/patients/${patientId}/complete-history`),
};

// Utilidades
export const apiUtils = {
  // Verificar si el backend está disponible
  checkBackendHealth: async () => {
    try {
      const response = await authAPI.testConnection();
      console.log('✅ Backend está funcionando:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Backend no disponible:', error.message);
      return false;
    }
  },
  
  // Formatear errores de API
  formatError: (error) => {
    if (error.response) {
      return `Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Error del servidor'}`;
    } else if (error.request) {
      return 'Error de conexión: No se puede conectar con el servidor';
    } else {
      return `Error: ${error.message}`;
    }
  },
  
  // Obtener URL base
  getBaseURL: () => API_BASE_URL,
};

// Exportar instancia de axios por defecto para casos especiales
export default api;

// Constantes útiles
export const API_ENDPOINTS = {
  LOGIN: '/login',
  USERS: '/users',
  APPOINTMENTS: '/appointments',
  PAYMENTS: '/payments',
  CLINICAL_NOTES: '/clinical-notes',
  REPORTS: '/reports',
  PSYCHOLOGISTS: '/psicologos',
  PATIENTS: '/pacientes',
  TEST_DATA: '/test-data',
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PSYCHOLOGIST: 'PSICOLOGO',
  PATIENT: 'PACIENTE',
};

export const APPOINTMENT_STATES = {
  RESERVED: 'RESERVADA',
  COMPLETED: 'COMPLETADA',
  CANCELLED: 'CANCELADA',
};

export const APPOINTMENT_MODALITIES = {
  IN_PERSON: 'PRESENCIAL',
  VIDEO_CALL: 'VIDEOLLAMADA',
};