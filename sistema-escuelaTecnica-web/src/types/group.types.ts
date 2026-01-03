import type { Level } from './course.types';
import type { Teacher } from './teacher.types';

export type GroupStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'GRADES_SUBMITTED' | 'COMPLETED' | 'CANCELLED';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Schedule {
    id: number;
    groupId?: number;
    courseId?: number;
    dayOfWeek: DayOfWeek;
    startTime: string; // ISO or HH:mm:ss
    endTime: string;
}

export interface Group {
    id: number;
    levelId: number;
    teacherId: number;
    name: string;
    code: string;
    startDate: string; // Date string
    endDate: string;
    maxCapacity: number;
    minCapacity: number;
    currentEnrolled: number;
    status: GroupStatus;
    classroom?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    level?: Level;
    teacher?: Teacher;
    schedules?: Schedule[];
    // enrollments?: Enrollment[];
}

export interface CreateGroupData {
    levelId: number;
    teacherId?: number;
    name?: string;
    code?: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    minCapacity?: number;
    classroom?: string;
    notes?: string;
    schedules?: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
    }[];
}

export interface UpdateGroupData extends Partial<CreateGroupData> {
    status?: GroupStatus;
}
