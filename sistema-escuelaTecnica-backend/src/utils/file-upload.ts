import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadToCloudinary = (buffer: Buffer, folder: string = 'students'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
                reject(new Error('Unknown error uploading to Cloudinary'));
            }
        );
        Readable.from(buffer).pipe(uploadStream);
    });
};
