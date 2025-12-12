export const AttendanceStatus = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    EXCUSED: 'EXCUSED'
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export interface AttendanceRecord {
    enrollmentId: number;
    studentId: number;
    studentName: string;
    registrationCode: string;
    status: AttendanceStatus | null;
    notes: string;
    arrivalTime: string | null;
}
