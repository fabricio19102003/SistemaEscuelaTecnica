// Student Portal Types

export interface EnrollmentWithDetails {
    id: number;
    enrollmentDate: string;
    startDate: string;
    endDate: string | null;
    status: string;
    agreedPrice: number;
    group: {
        id: number;
        name: string;
        code: string;
        startDate: string;
        endDate: string;
        teacher: {
            user: {
                firstName: string;
                paternalSurname: string;
                maternalSurname: string | null;
                profileImageUrl: string | null;
            };
        };
        level: {
            name: string;
            course: {
                id: number;
                name: string;
                code: string;
                description: string | null;
                imageUrl: string | null;
                schedules: CourseSchedule[];
            };
        };
        schedules: Schedule[];
    };
}

export interface Schedule {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export interface CourseSchedule extends Schedule { }

export interface Grade {
    id: number;
    evaluationName: string;
    evaluationType: string;
    gradeValue: number;
    maxGrade: number;
    weight: number;
    evaluationDate: string;
    progressTest: number | null;
    classPerformance: number | null;
    comments: string | null;
}

export interface GradeStats {
    averageGrade: number;
    totalEvaluations: number;
    passedEvaluations: number;
}

export interface GradeResponse {
    enrollment: EnrollmentWithDetails;
    grades: Grade[];
    stats: GradeStats;
}

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

export interface AttendanceRecord {
    id: number;
    attendanceDate: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    arrivalTime: string | null;
    notes: string | null;
}

export interface AttendanceStats {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    attendancePercentage: number;
}

export interface AttendanceResponse {
    attendances: AttendanceRecord[];
    stats: AttendanceStats;
}

// Guardian Portal Types

export interface StudentInfo {
    id: number;
    registrationCode: string;
    documentNumber: string;
    enrollmentStatus: string;
    user: {
        firstName: string;
        paternalSurname: string;
        maternalSurname: string | null;
        email: string | null;
        phone: string | null;
        profileImageUrl: string | null;
    };
    relationship: string;
    isPrimary: boolean;
    activeEnrollments: number;
}
