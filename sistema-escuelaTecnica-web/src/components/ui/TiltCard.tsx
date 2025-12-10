import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    gradientColor?: string;
}

const ROTATION_RANGE = 25; // Degrees
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', gradientColor = '#3b82f6' }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x);
    const ySpring = useSpring(y);

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = (e.clientX - rect.left) * ROTATION_RANGE / width - HALF_ROTATION_RANGE;
        const mouseY = (e.clientY - rect.top) * ROTATION_RANGE / height - HALF_ROTATION_RANGE;

        const rX = mouseY * -1;
        const rY = mouseX;

        x.set(rX);
        y.set(rY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                transform,
            }}
            className={`relative group rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden ${className}`}
        >
            <div 
                style={{
                    transform: "translateZ(50px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative z-10 h-full w-full"
            >
                {children}
            </div>

            {/* Gradient Overlay for "Sheen" effect */}
            <motion.div
                className="absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${gradientColor}, transparent 80%)`,
                    transform: "translateZ(20px)",
                }}
            />
        </motion.div>
    );
};

export default TiltCard;
