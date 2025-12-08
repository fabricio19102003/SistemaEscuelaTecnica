import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/layouts/AuthLayout';
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
// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                </Route>

                {/* Protected Routes */}
                 <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<div className="text-gray-600">Dashboard Overview Content (Widgets go here)</div>} />
                    <Route path="students" element={<StudentListPage />} />
                <Route path="students/new" element={<StudentFormPage />} />
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
                </Route>

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
