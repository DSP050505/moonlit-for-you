import React from 'react';
import confetti from 'canvas-confetti';

interface ConfettiTriggerProps {
    type?: 'hearts' | 'stars' | 'celebration';
}

export const fireConfetti = (type: 'hearts' | 'stars' | 'celebration' = 'celebration') => {
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 10000,
    };

    switch (type) {
        case 'hearts':
            confetti({
                ...defaults,
                particleCount: 150,
                spread: 70,
                shapes: ['circle'],
                colors: ['#F2A7C3', '#E8788A', '#C4B1D4', '#ff69b4', '#ff1493'],
                gravity: 0.8,
                ticks: 200,
                scalar: 1.2,
            });
            break;

        case 'stars':
            confetti({
                ...defaults,
                particleCount: 100,
                spread: 100,
                shapes: ['star'],
                colors: ['#F5D380', '#C8D0E0', '#F2A7C3', '#ffffff'],
                gravity: 0.6,
                ticks: 200,
            });
            break;

        case 'celebration':
        default:
            // Left side
            confetti({
                ...defaults,
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#F2A7C3', '#E8788A', '#C4B1D4', '#F5D380', '#7ECFA0'],
            });
            // Right side
            confetti({
                ...defaults,
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#F2A7C3', '#E8788A', '#C4B1D4', '#F5D380', '#7ECFA0'],
            });
            break;
    }
};

const ConfettiTrigger: React.FC<ConfettiTriggerProps> = ({ type = 'celebration' }) => {
    React.useEffect(() => {
        fireConfetti(type);
    }, [type]);

    return null;
};

export default ConfettiTrigger;
