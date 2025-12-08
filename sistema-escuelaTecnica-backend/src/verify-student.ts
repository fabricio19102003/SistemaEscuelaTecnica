import 'dotenv/config';

async function verifyStudentCreation() {
    try {
        console.log('Testing Create Student API...');
        const response = await fetch('http://localhost:3000/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'Juan',
                paternalSurname: 'Perez',
                maternalSurname: 'Gomez',
                email: 'juan.perez@student.com', // Unique email
                dateOfBirth: '2012-05-15', // 12-13 years old
                gender: 'M',
                address: 'Av. Siempre Viva 123',
                medicalNotes: 'None',
                // Optional Guardian
                guardian: {
                    email: 'padre.juan@email.com',
                    password: 'securepassword',
                    firstName: 'Carlos',
                    lastName: 'Perez',
                    phone: '70099999',
                    documentType: 'DNI',
                    documentNumber: '87654321',
                    relationship: 'FATHER',
                    occupation: 'Engineer',
                    workplace: 'Tech Corp'
                }
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('✅ Student created successfully!');
        console.log('Student ID:', data?.data?.student?.id);
        console.log('User ID:', data?.data?.user?.id);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyStudentCreation();
