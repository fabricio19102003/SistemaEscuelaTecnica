
import 'dotenv/config';
console.log('Current Directory:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
const url = process.env.DATABASE_URL || '';
console.log('DATABASE_URL Length:', url.length);
console.log('DATABASE_URL Starts with:', url.substring(0, 10));
