import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
    User,
    Class,
    Exam,
    Submission,
    Settings,
    LoginResponse,
    StudentStatus,
    ExamProgress
} from '../types';

// API base URL - will use Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        localStorage.setItem('auth_token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('auth_token');
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Initialize token if exists
if (authToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            setAuthToken(null);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTH API ==========

export const authAPI = {
    login: async (data: {
        username: string;
        password?: string;
        nisn?: string;
        role: string;
    }): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        if (response.data.token) {
            setAuthToken(response.data.token);
        }
        return response.data;
    },

    register: async (data: {
        username: string;
        email?: string;
        password?: string;
        role: string;
        nisn?: string;
    }): Promise<{ success: boolean; user: User }> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    logout: async (userId?: string) => {
        await apiClient.post('/auth/logout', { userId });
        setAuthToken(null);
    }
};

// ========== CLASSES API ==========

export const classAPI = {
    getAll: async (): Promise<Class[]> => {
        const response = await apiClient.get<Class[]>('/classes');
        return response.data;
    },

    getById: async (id: string): Promise<Class> => {
        const response = await apiClient.get<Class>(`/classes/${id}`);
        return response.data;
    },

    create: async (data: Partial<Class>): Promise<Class> => {
        const response = await apiClient.post<Class>('/classes', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Class>): Promise<Class> => {
        const response = await apiClient.put<Class>(`/classes/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/classes/${id}`);
    },

    join: async (inviteCode: string): Promise<{ success: boolean; message: string; class: Class }> => {
        const response = await apiClient.post('/classes/join', { inviteCode });
        return response.data;
    },

    getStudents: async (classId: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/classes/${classId}/students`);
        return response.data;
    }
};

// ========== EXAMS API ==========

export const examAPI = {
    getAll: async (): Promise<Exam[]> => {
        const response = await apiClient.get<Exam[]>('/exams');
        return response.data;
    },

    getById: async (id: string): Promise<Exam> => {
        const response = await apiClient.get<Exam>(`/exams/${id}`);
        return response.data;
    },

    create: async (data: Partial<Exam>): Promise<Exam> => {
        const response = await apiClient.post<Exam>('/exams', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Exam>): Promise<Exam> => {
        const response = await apiClient.put<Exam>(`/exams/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/exams/${id}`);
    },

    publish: async (id: string): Promise<{ success: boolean; message: string; exam: Exam }> => {
        const response = await apiClient.post(`/exams/${id}/publish`);
        return response.data;
    }
};

// ========== SUBMISSIONS API ==========

export const submissionAPI = {
    getAll: async (): Promise<Submission[]> => {
        const response = await apiClient.get<Submission[]>('/submissions');
        return response.data;
    },

    getById: async (id: string): Promise<Submission> => {
        const response = await apiClient.get<Submission>(`/submissions/${id}`);
        return response.data;
    },

    start: async (examId: string): Promise<Submission> => {
        const response = await apiClient.post<Submission>('/submissions/start', { examId });
        return response.data;
    },

    submit: async (submissionId: string, answers: any[]): Promise<{
        success: boolean;
        score: number;
        maxScore: number;
        percentage: string;
        answers: any[];
    }> => {
        const response = await apiClient.post('/submissions/submit', { submissionId, answers });
        return response.data;
    },

    getByExam: async (examId: string): Promise<Submission[]> => {
        const response = await apiClient.get<Submission[]>(`/submissions/exam/${examId}`);
        return response.data;
    }
};

// ========== USERS API ==========

export const userAPI = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await apiClient.get<User>(`/users/${id}`);
        return response.data;
    },

    create: async (data: Partial<User>): Promise<User> => {
        const response = await apiClient.post<User>('/users', data);
        return response.data;
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    toggleSuspend: async (id: string): Promise<{ success: boolean; message: string; user: User }> => {
        const response = await apiClient.put(`/users/${id}/suspend`);
        return response.data;
    }
};

// ========== SETTINGS API ==========

export const settingsAPI = {
    get: async (): Promise<Settings> => {
        const response = await apiClient.get<Settings>('/settings');
        return response.data;
    },

    update: async (data: Partial<Settings>): Promise<{ success: boolean; message: string; settings: Settings }> => {
        const response = await apiClient.put('/settings', data);
        return response.data;
    },

    testDatabase: async (mongodbUrl: string): Promise<{ success: boolean; mode: string; message: string }> => {
        const response = await apiClient.post('/settings/test-db', { mongodbUrl });
        return response.data;
    }
};

// ========== REALTIME API ==========

export const realtimeAPI = {
    heartbeat: async (): Promise<{ success: boolean }> => {
        const response = await apiClient.post('/realtime/heartbeat');
        return response.data;
    },

    getStudentStatus: async (classId?: string): Promise<StudentStatus[]> => {
        const response = await apiClient.get<StudentStatus[]>('/realtime/status', {
            params: classId ? { classId } : {}
        });
        return response.data;
    },

    getExamProgress: async (examId?: string): Promise<ExamProgress[]> => {
        const response = await apiClient.get<ExamProgress[]>('/realtime/progress', {
            params: examId ? { examId } : {}
        });
        return response.data;
    }
};

export default {
    auth: authAPI,
    classes: classAPI,
    exams: examAPI,
    submissions: submissionAPI,
    users: userAPI,
    settings: settingsAPI,
    realtime: realtimeAPI
};
