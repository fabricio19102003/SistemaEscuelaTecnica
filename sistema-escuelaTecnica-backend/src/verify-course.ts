import 'dotenv/config';

async function verifyCourseFlow() {
    try {
        console.log('Testing Course Management Flow...');

        // 1. Create Course
        console.log('1. Creating Course...');
        const courseRes = await fetch('http://localhost:3000/api/academic/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'English for Kids - Beginner',
                code: 'ENG-KIDS-BEG',
                description: 'Introduction to English for children aged 8-10.',
                minAge: 8,
                maxAge: 10,
                durationMonths: 6
            })
        });

        if (!courseRes.ok) throw new Error(await courseRes.text());
        const course = await courseRes.json();
        console.log('✅ Course created:', course.code);

        // 2. Create Level
        console.log('2. Creating Level for Course...');
        const levelRes = await fetch(`http://localhost:3000/api/academic/courses/${course.id}/levels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Level 1: Basic Vocabulary',
                code: 'L1',
                orderIndex: 1,
                durationWeeks: 4,
                totalHours: 16,
                basePrice: 150.00,
                objectives: 'Learn colors, numbers, and basic greetings.'
            })
        });

        if (!levelRes.ok) throw new Error(await levelRes.text());
        const level = await levelRes.json();
        console.log('✅ Level created:', level.name);

        // 3. Create Group (Needs a teacher, we'll use ID 1 from previous step if exists, or assume 1)
        // Note: Make sure Teacher ID 1 exists from previous run
        console.log('3. Creating Group...');
        const groupRes = await fetch('http://localhost:3000/api/academic/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                levelId: level.id,
                teacherId: 1, // Assuming Teacher ID 1 exists
                name: 'Group A - Morning',
                code: 'GRP-KIDS-L1-A',
                startDate: '2025-03-01',
                endDate: '2025-03-30',
                maxCapacity: 15,
                classroom: 'Room 101',
                schedules: [
                    { dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '11:00:00' },
                    { dayOfWeek: 'WEDNESDAY', startTime: '09:00:00', endTime: '11:00:00' }
                ]
            })
        });

        if (!groupRes.ok) throw new Error(await groupRes.text());
        const group = await groupRes.json();
        console.log('✅ Group created:', group.code);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyCourseFlow();
