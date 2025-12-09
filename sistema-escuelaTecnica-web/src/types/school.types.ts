import type { Agreement } from './agreement.types';

export interface School {
    id: number;
    name: string;
    code: string;
    sieCode?: string;
    directorName?: string;
    directorPhone?: string;
    levels?: string[]; // Stored as JSON array in DB
    address?: string;
    district?: string;
    city?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    agreement?: Agreement;
}

export interface CreateSchoolDTO {
    name: string;
    // code: string; // Auto-generated
    sieCode?: string;
    directorName?: string;
    directorPhone?: string;
    levels?: string[];
    address?: string;
    district?: string;
    city?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    contactPhone?: string;
}

export interface UpdateSchoolDTO extends Partial<CreateSchoolDTO> {
    isActive?: boolean;
}
