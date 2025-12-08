


async function main() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@escuelatecnica.com',
                password: 'admin123'
            })
        });

        if (!response.ok) {
            console.error('Login failed:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text);
            process.exit(1);
        }

        const data = await response.json();
        console.log('Login successful!');
        console.log('Token received:', data.token ? 'Yes' : 'No');
        console.log('User:', data.user);
    } catch (error) {
        console.error('Error verifying login:', error);
        process.exit(1);
    }
}

main();
