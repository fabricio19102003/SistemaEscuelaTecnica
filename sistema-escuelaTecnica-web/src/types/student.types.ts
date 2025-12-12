import type { School } from './school.types';

export interface Student {
    id: number;
    userId: number;
    registrationCode: string; // NEW
    documentType: string;
    documentNumber: string;
    dateOfBirth: string; // ISO Date
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    previousSchool?: string; // NEW
    schoolId?: number | null; // Database School ID
    school?: School;
    enrollmentStatus: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED' | 'RETIRADO' | 'ABANDONO' | 'NO_INCORPORADO';
    enrollmentYear?: number; // Optional or derived
    user: {
        id: number;
        firstName: string;
        paternalSurname: string; // NEW
        maternalSurname?: string; // NEW
        email: string;
        phone?: string;
        profileImageUrl?: string;
        isActive: boolean;
        role?: string;
    },
    studentGuardians?: {
        guardian: {
            user: {
                firstName: string;
                paternalSurname: string;
                maternalSurname?: string;
                email: string;
                phone?: string;
            },
            documentType: string;
            documentNumber: string;
            relationship: 'FATHER' | 'MOTHER' | 'TUTOR' | 'OTHER';
            occupation?: string;
            workplace?: string;
        }
    }[];
}

export interface GuardianDTO {
    firstName: string;
    paternalSurname: string;
    maternalSurname?: string;
    email: string;
    phone?: string;
    documentType: string;
    documentNumber: string;
    relationship: 'FATHER' | 'MOTHER' | 'TUTOR' | 'OTHER';
    occupation?: string;
    workplace?: string;
}

export interface CreateStudentDTO {
    // User Info
    email: string;
    firstName: string;
    paternalSurname: string;
    maternalSurname?: string;
    phone?: string;

    // Student Info
    documentType: string;
    documentNumber: string;
    birthDate: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    previousSchool?: string;
    schoolId?: number;
    medicalNotes?: string;

    // Guardian Info (Optional)
    guardian?: GuardianDTO;

    // Photo (Handled separately via FormData usually, but defined here for type completeness if needed)
}

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> { }

export interface AcademicHistoryRecord {
    id: number;
    enrollmentDate: string;
    year: number;
    period: string;
    courseName: string;
    courseCode: string;
    levelName: string;
    finalGrade: number | null;
    status: string;
    certificateUrl: string | null;
}
