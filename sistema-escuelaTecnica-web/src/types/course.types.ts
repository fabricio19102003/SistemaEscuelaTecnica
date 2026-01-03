export interface Level {
    id: number;
    courseId: number;
    name: string;
    code: string;
    orderIndex: number;
    description?: string;
    durationWeeks: number;
    totalHours: number;
    basePrice: number; // Decimal in DB, number in JS
    objectives?: string;
    requirements?: string;
    isActive: boolean;
    course?: Course;
}

export interface Schedule {
    id: number;
    courseId?: number;
    groupId?: number;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string; // ISO date or time string
    endTime: string;
}

export interface Course {
    id: number;
    name: string;
    code: string;
    description?: string;
    durationWeeks?: number;
    basePrice?: number;
    imageUrl?: string;
    isActive: boolean;
    levels?: Level[];
    teacherId?: number;
    previousCourseId?: number | null;
    classrooms?: { id: number; name: string }[];
    teacher?: {
        user: {
            firstName: string;
            paternalSurname: string;
            maternalSurname: string | null;
        }
    };
    // classroom?: any; removed
    schedules?: Schedule[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCourseData {
    name: string;
    // code: string; // Auto-generated
    description?: string;
    durationWeeks?: number;
    basePrice?: number;
    image?: File;
    teacherId?: number;
    previousCourseId?: number | null;
    classroomIds?: number[];
    schedules?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
    isActive?: boolean;
}
