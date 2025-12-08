import 'dotenv/config';

async function verifyTeacherCreation() {
    try {
        console.log('Testing Create Teacher API...');
        const response = await fetch('http://localhost:3000/api/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hourlyRate: 50.00
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('✅ Teacher created successfully!');
        console.log('Teacher ID:', data.data.teacher.id);
        console.log('User ID:', data.data.user.id);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyTeacherCreation();
