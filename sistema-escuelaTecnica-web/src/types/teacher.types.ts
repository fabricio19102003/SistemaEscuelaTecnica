export interface Teacher {
    id: number;
    userId: number;
    documentType: 'DNI' | 'CE' | 'PASSPORT' | 'OTHER';
    documentNumber: string;
    specialization: string | null;
    hireDate: string; // ISO Date
    contractType: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
    hourlyRate: string | number | null; // Decimal in DB
    cvUrl: string | null;
    isActive: boolean;
    user: {
        id: number;
        firstName: string;
        paternalSurname: string;
        maternalSurname: string | null;
        email: string;
        phone: string | null;
        profileImageUrl: string | null;
        isActive: boolean;
    };
}

export interface TeacherFormDTO {
    // User
    firstName: string;
    paternalSurname: string;
    maternalSurname?: string;
    email: string;
    phone?: string;

    // Teacher
    documentType: string;
    documentNumber: string;
    specialization: string;
    hireDate: string;
    contractType: string;
    hourlyRate?: string;

    photo?: File;
}

// For state/API mostly
export interface CreateTeacherDTO {
    // ... same as form but photo handling is separate via FormData
}
