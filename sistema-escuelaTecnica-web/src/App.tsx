import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import { useAuthStore } from './store/auth.store';
import StudentListPage from './pages/students/StudentListPage';
import StudentFormPage from './pages/students/StudentFormPage';
import type { JSX } from 'react';
import SchoolListPage from './pages/schools/SchoolListPage';
import SchoolFormPage from './pages/schools/SchoolFormPage';
import TeacherListPage from './pages/teachers/TeacherListPage';

import TeacherFormPage from './pages/teachers/TeacherFormPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseFormPage from './pages/courses/CourseFormPage';
import GroupListPage from './pages/groups/GroupListPage';
import GroupFormPage from './pages/groups/GroupFormPage';
import AgreementListPage from './pages/agreements/AgreementListPage';
import AgreementFormPage from './pages/agreements/AgreementFormPage';
import EnrollmentListPage from './pages/enrollments/EnrollmentListPage';
import EnrollmentFormPage from './pages/enrollments/EnrollmentFormPage';
import GradeEntryPage from './pages/grades/GradeEntryPage';
import GradeDashboardPage from './pages/grades/GradeDashboardPage';
import GradeReportsPage from './pages/grades/GradeReportsPage';
import GradeStatsPage from './pages/grades/GradeStatsPage';
import OfficialReportPage from './pages/grades/OfficialReportPage';
import UserDashboardPage from './pages/users/UserDashboardPage';
import UserFormPage from './pages/users/UserFormPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import StudentHistoryPage from './pages/students/StudentHistoryPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
    const { isAuthenticated, user } = useAuthStore();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user) {
        const hasRole = user.roles.some(role => allowedRoles.includes(role));
        if (!hasRole) {
            return <Navigate to="/dashboard" replace />; // Or unauthorized page
        }
    }

    return children;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, user } = useAuthStore();
    if (isAuthenticated) {
        if (user?.roles.includes('TEACHER')) {
            return <Navigate to="/teacher" replace />;
        }
        if (user?.roles.includes('STUDENT')) {
            return <Navigate to="/student/portal" replace />;
        }
        if (user?.roles.includes('GUARDIAN')) {
            return <Navigate to="/guardian/portal" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

import TeacherDashboardLayout from './layouts/TeacherDashboardLayout';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherCourseDetailPage from './pages/teacher/TeacherCourseDetailPage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import StudentPortalPage from './pages/student/StudentPortalPage';
import StudentCoursePage from './pages/student/StudentCoursePage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import GuardianPortalPage from './pages/guardian/GuardianPortalPage';
import GuardianStudentCoursePage from './pages/guardian/GuardianStudentCoursePage';
import StudentLayout from './layouts/StudentLayout';
import GuardianLayout from './layouts/GuardianLayout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                {/* Teacher Routes */}
                <Route path="/teacher" element={
                    <ProtectedRoute allowedRoles={['TEACHER']}>
                        <TeacherDashboardLayout />
                    </ProtectedRoute>
                }>
                    {/* Module: My Courses (Students) */}
                    <Route path="courses" element={<TeacherCoursesPage basePath="/teacher/courses" />} />
                    <Route path="courses/:groupId" element={<TeacherCourseDetailPage defaultTab="students" />} />
                    <Route path="courses/:groupId/attendance" element={<TeacherAttendancePage />} />
                    
                    {/* Module: Grades (Enty) */}
                    <Route path="grades" element={<TeacherCoursesPage basePath="/teacher/grades" />} />
                    <Route path="grades/:groupId" element={<TeacherCourseDetailPage defaultTab="grades" />} />
                    
                    <Route path="notifications" element={<TeacherNotificationsPage />} />

                    <Route index element={<Navigate to="courses" replace />} />
                </Route>

                {/* Student Routes */}
                <Route path="/student" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <StudentLayout />
                    </ProtectedRoute>
                }>
                    <Route path="portal" element={<StudentPortalPage />} />
                    <Route path="course/:enrollmentId" element={<StudentCoursePage />} />
                    <Route path="notifications" element={<StudentNotificationsPage />} />
                    {/* Default redirect to portal */}
                    <Route index element={<Navigate to="portal" replace />} />
                </Route>

                {/* Guardian Routes */}
                <Route path="/guardian" element={
                    <ProtectedRoute allowedRoles={['GUARDIAN']}>
                        <GuardianLayout />
                    </ProtectedRoute>
                }>
                    <Route path="portal" element={<GuardianPortalPage />} />
                    <Route path="student/:studentId/course/:enrollmentId" element={<GuardianStudentCoursePage />} />
                    {/* Default redirect to portal */}
                    <Route index element={<Navigate to="portal" replace />} />
                </Route>

                {/* Admin/Staff Protected Routes */}
                 <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="students" element={<StudentListPage />} />
                    <Route path="students/new" element={<StudentFormPage />} />
                    <Route path="students/:id" element={<StudentHistoryPage />} />
                    <Route path="students/:id/edit" element={<StudentFormPage />} />
                
                <Route path="schools" element={<SchoolListPage />} />
                <Route path="schools/new" element={<SchoolFormPage />} />
                <Route path="schools/:id" element={<SchoolFormPage />} />
                <Route path="teachers" element={<TeacherListPage />} />
                <Route path="teachers/new" element={<TeacherFormPage />} />
                <Route path="teachers/:id/edit" element={<TeacherFormPage />} />
                    
                    <Route path="courses" element={<CourseListPage />} />
                    <Route path="courses/new" element={<CourseFormPage />} />
                    <Route path="courses/:id" element={<CourseFormPage />} />
                    
                    <Route path="groups" element={<GroupListPage />} />
                    <Route path="groups/new" element={<GroupFormPage />} />
                    <Route path="groups/:id" element={<GroupFormPage />} />

                    <Route path="agreements" element={<AgreementListPage />} />
                    <Route path="agreements/new" element={<AgreementFormPage />} />

                    <Route path="agreements/:id" element={<AgreementFormPage />} />

                    <Route path="enrollments" element={<EnrollmentListPage />} />
                    <Route path="enrollments/new" element={<EnrollmentFormPage />} />
                    
                    <Route path="grades" element={<GradeDashboardPage />} />
                    <Route path="grades/entry" element={<GradeEntryPage />} />
                    <Route path="grades/reports" element={<GradeReportsPage />} />
                    <Route path="grades/stats" element={<GradeStatsPage />} />
                    <Route path="grades/official-report" element={<OfficialReportPage />} />

                    {/* Users Routes */}
                    <Route path="users" element={<UserDashboardPage />} />
                    <Route path="users/new" element={<UserFormPage />} />
                    <Route path="users/:id/edit" element={<UserFormPage />} />
                </Route>

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
