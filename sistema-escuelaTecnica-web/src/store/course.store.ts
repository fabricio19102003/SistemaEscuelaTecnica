import { create } from 'zustand';
import { CourseService } from '../services/api/course.service';
import type { Course } from '../types/course.types';

interface CourseState {
    courses: Course[];
    selectedCourse: Course | null;
    isLoading: boolean;
    fetchCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
    courses: [],
    selectedCourse: null,
    isLoading: false,
    fetchCourses: async () => {
        set({ isLoading: true });
        try {
            const data = await CourseService.getAll();
            set({ courses: data, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    }
}));
