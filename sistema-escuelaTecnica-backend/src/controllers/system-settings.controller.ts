import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

// Get setting by key
export const getSetting = async (req: Request, res: Response) => {
    const { key } = req.params;

    if (!key) {
        return res.status(400).json({ message: 'Key is required' });
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: String(key) }
        });

        // Default values if not found
        if (!setting) {
            // Define defaults here
            const defaults: Record<string, string> = {
                'GRADES_OPEN': 'true'
            };

            if (key in defaults) {
                return res.json({ key, value: defaults[key] });
            }
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ message: 'Error fetching setting' });
    }
};

// Update setting
export const updateSetting = async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value } = req.body; // Expecting { value: "true" | "false" }

    if (!key) {
        return res.status(400).json({ message: 'Key is required' });
    }

    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: String(key) },
            update: { value: String(value) },
            create: { key: String(key), value: String(value) }
        });

        res.json(setting);
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ message: 'Error updating setting' });
    }
};

// Get all settings (optional, useful for admin dashboard startup)
export const getAllSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();

        // Merge with defaults for missing keys
        // Calculate Current Period
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        const period = month < 6 ? 1 : 2;
        const currentPeriodKey = 'CURRENT_PERIOD';
        const currentPeriodValue = `${period}-${year}`;

        // Merge with defaults for missing keys
        const defaults: Record<string, string> = {
            'GRADES_OPEN': 'true',
            [currentPeriodKey]: currentPeriodValue
        };

        const result = { ...defaults };
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        // Always override calculated values if they shouldn't be manually set, 
        // OR keep them as defaults that CAN be overridden by DB if we allowed manual override.
        // For "Current Period", it sounds like it should be strictly automatic based on date, 
        // effectively ignoring DB if we want it "automatic". 
        // But the user asked for "update automatically", which implies the system source of truth is the date.
        // Let's enforce it in the output regardless of DB state for now, or just use it as default.
        // If we want it strictly automatic:
        result[currentPeriodKey] = currentPeriodValue;

        // Convert to array or object as needed by frontend. Let's send array.
        const resultArray = Object.entries(result).map(([key, value]) => ({ key, value }));

        res.json(resultArray);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};
