import axios from './api/axios';

export interface Grade {
    id: number;
    enrollmentId: number;
    evaluationType: string;
    gradeValue: number;
    progressTest?: number;
    classPerformance?: number;
    comments: string;
}

export interface EnrollmentWithGrades {
    id: number;
    student: {
        id: number;
        registrationCode?: string;
        documentNumber?: string;
        user: {
            id: number;
            firstName: string;
            paternalSurname: string;
            maternalSurname: string;
            profileImageUrl?: string;
        }
    };
    group?: {
        id: number;
        level?: {
            id: number;
            course?: {
                id: number;
                name: string;
            }
        }
    };
    grades: Grade[];
}

export const getGradesByGroup = async (groupId: number) => {
    const response = await axios.get<EnrollmentWithGrades[]>(`/grades/group/${groupId}`);
    return response.data;
};

export const getGradesByCourse = async (courseId: number) => {
    const response = await axios.get<EnrollmentWithGrades[]>(`/grades/course/${courseId}`);
    return response.data;
};

export const getAllGradesStats = async () => {
    const response = await axios.get<EnrollmentWithGrades[]>('/grades/stats/all');
    return response.data;
};

export const saveGrades = async (enrollmentId: number, grades: any[]) => {
    const response = await axios.post('/grades/save', { enrollmentId, grades });
    return response.data;
};

export const getGroupReport = async (groupId: number) => {
    const response = await axios.get(`/grades/report/group/${groupId}`);
    return response.data;
};
