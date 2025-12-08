import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, expiresIn: string | number = ENV.JWT_EXPIRES_IN): string => {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, ENV.JWT_SECRET);
    } catch (error) {
        return null;
    }
};
