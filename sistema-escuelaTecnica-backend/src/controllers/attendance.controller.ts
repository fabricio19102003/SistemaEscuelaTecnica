import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AttendanceStatus } from '@prisma/client';

export const getAttendanceByGroupAndDate = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { date } = req.query;
        // Assuming user is attached to request by auth middleware
        const teacherId = (req as any).user?.teacher?.id;
        const userId = (req as any).user?.id;
        const userRole = (req as any).user?.userRoles?.[0]?.role?.name;

        if (!groupId || !date) {
            return res.status(400).json({ message: 'Group ID and Date are required' });
        }

        const group = await prisma.group.findUnique({
            where: { id: Number(groupId) },
            include: {
                teacher: true,
            },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Security check: only the assigned teacher or an admin can view/take attendance
        // If we have role based access, we might check that. 
        // Ideally we assume the middleware allows teachers/admins.
        // If strict check needed:
        if (userRole === 'TEACHER' && group.teacherId !== teacherId) {
            return res.status(403).json({ message: 'You are not assigned to this group' });
        }

        const queryDate = new Date(date as string);

        // Fetch active enrollments for this group
        const enrollments = await prisma.enrollment.findMany({
            where: {
                groupId: Number(groupId),
                status: 'ACTIVE',
            },
            include: {
                student: {
                    include: {
                        user: true // To get names
                    }
                },
                attendances: {
                    where: {
                        attendanceDate: queryDate,
                    },
                },
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });

        // Map to a cleaner structure
        const attendanceList = enrollments.map((env: any) => {
            const attendance = env.attendances[0]; // Specific for that date
            return {
                enrollmentId: env.id,
                studentId: env.studentId,
                studentName: `${env.student.user.paternalSurname} ${env.student.user.maternalSurname || ''} ${env.student.user.firstName}`.trim(),
                registrationCode: env.student.registrationCode,
                status: attendance ? attendance.status : null, // null means not taken yet
                notes: attendance ? attendance.notes : '',
                arrivalTime: attendance ? attendance.arrivalTime : null,
            };
        });

        res.json(attendanceList);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

export const saveAttendanceBatch = async (req: Request, res: Response) => {
    try {
        const { groupId, date, records } = req.body;
        const teacherId = (req as any).user?.teacher?.id;
        const userId = (req as any).user?.id;

        // records: { enrollmentId: number, status: AttendanceStatus, notes?: string, arrivalTime?: string }[]

        if (!groupId || !date || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Optional: Verify teacher ownership again related to the group if strict.

        const attendanceDate = new Date(date);

        // Use transaction for batch update
        await prisma.$transaction(
            records.map((record: any) => {
                return prisma.attendance.upsert({
                    where: {
                        enrollmentId_attendanceDate: {
                            enrollmentId: record.enrollmentId,
                            attendanceDate: attendanceDate
                        }
                    },
                    update: {
                        status: record.status as AttendanceStatus,
                        notes: record.notes,
                        arrivalTime: record.arrivalTime ? new Date(`1970-01-01T${record.arrivalTime}Z`) : null, // Handle time appropriately
                        recordedBy: teacherId // Assuming 'recordedBy' points to a specific user or teacher ID table depending on schema. Schema says 'markedBy User?' or 'recordedBy Teacher?'
                        // Schema: recordedBy Int? @map("recorded_by") -> Teacher? relation("AttendanceRecorder")
                    },
                    create: {
                        enrollmentId: record.enrollmentId,
                        attendanceDate: attendanceDate,
                        status: record.status as AttendanceStatus,
                        notes: record.notes,
                        arrivalTime: record.arrivalTime ? new Date(`1970-01-01T${record.arrivalTime}Z`) : null,
                        recordedBy: teacherId
                    }
                })
            })
        );

        res.json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Error saving attendance' });
    }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { startDate, endDate } = req.query;

        if (!groupId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Group ID, Start Date and End Date are required' });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Fetch all active enrollments (to include students with 0 attendance records)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                groupId: Number(groupId),
                status: 'ACTIVE'
            },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                attendances: {
                    where: {
                        attendanceDate: {
                            gte: start,
                            lte: end
                        }
                    }
                }
            },
            orderBy: {
                student: {
                    user: {
                        paternalSurname: 'asc'
                    }
                }
            }
        });

        // Calculate stats
        const stats = enrollments.map((env: any) => {
            const totalRecords = env.attendances.length;
            const presentCount = env.attendances.filter((a: any) => a.status === AttendanceStatus.PRESENT).length;
            const absentCount = env.attendances.filter((a: any) => a.status === AttendanceStatus.ABSENT).length;
            const lateCount = env.attendances.filter((a: any) => a.status === AttendanceStatus.LATE).length;
            const excusedCount = env.attendances.filter((a: any) => a.status === AttendanceStatus.EXCUSED).length;

            return {
                studentId: env.student.id,
                studentName: `${env.student.user.paternalSurname} ${env.student.user.maternalSurname || ''} ${env.student.user.firstName}`.trim(),
                registrationCode: env.student.registrationCode,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                excused: excusedCount,
                totalRecords
            };
        });

        const distinctDates = await prisma.attendance.groupBy({
            by: ['attendanceDate'],
            where: {
                enrollment: {
                    groupId: Number(groupId)
                },
                attendanceDate: {
                    gte: start,
                    lte: end
                }
            }
        });
        const totalClasses = distinctDates.length;

        const finalStats = stats.map((stat: any) => {
            // Effective present = Present + Late
            const effectivePresent = stat.present + stat.late;
            const percentage = totalClasses > 0 ? ((effectivePresent / totalClasses) * 100).toFixed(1) : '0.0';

            return {
                ...stat,
                totalClasses,
                percentage
            };
        });

        res.json({
            stats: finalStats,
            period: {
                start: startDate,
                end: endDate,
                totalClasses
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
};
