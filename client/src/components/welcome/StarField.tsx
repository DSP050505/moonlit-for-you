import React, { useMemo } from 'react';

interface StarFieldProps {
    count?: number;
}

const StarField: React.FC<StarFieldProps> = ({ count = 50 }) => {
    const stars = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 2.5 + 1, // 1px to 3.5px
            duration: 2 + Math.random() * 4, // 2s to 6s
            delay: Math.random() * 5, // 0s to 5s
            opacity: 0.3 + Math.random() * 0.7, // 0.3 to 1.0
        }));
    }, [count]);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        >
            {stars.map((star) => (
                <div
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: star.left,
                        top: star.top,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        background: star.size > 2.5
                            ? 'var(--accent-gold)'
                            : star.size > 1.5
                                ? 'var(--accent-silver)'
                                : '#ffffff',
                        borderRadius: '50%',
                        opacity: 0,
                        animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                        boxShadow: star.size > 2
                            ? `0 0 ${star.size * 2}px ${star.size > 2.5 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'}`
                            : 'none',
                    }}
                />
            ))}
        </div>
    );
};

export default StarField;
