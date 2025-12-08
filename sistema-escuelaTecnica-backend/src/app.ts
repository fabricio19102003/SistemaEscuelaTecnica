import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import path from 'path';
import { MulterError } from 'multer';
import type { Request, Response, NextFunction } from 'express';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'El archivo es demasiado grande. El límite es de 10MB.'
            });
        }
        return res.status(400).json({
            message: `Error al subir archivo: ${err.message}`
        });
    }

    console.error(err);
    res.status(500).json({
        message: 'Internal Server Error'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
