import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover3D?: boolean;
    glow?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover3D = true,
    glow = false,
    onClick,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
        stiffness: 300,
        damping: 30,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
        stiffness: 300,
        damping: 30,
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hover3D || !cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            className={`card-glass ${glow ? 'card-glow' : ''} ${className}`}
            style={hover3D ? { rotateX, rotateY, perspective: 800 } : undefined}
            whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

export default Card;
