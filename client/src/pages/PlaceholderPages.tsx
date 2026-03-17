import React from 'react';
import { motion } from 'framer-motion';
import Card from '../components/shared/Card';

interface PlaceholderPageProps {
    title: string;
    icon: string;
    description: string;
    comingSoonLabel?: string;
}

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    title,
    icon,
    description,
    comingSoonLabel = 'Coming Soon',
}) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - var(--topbar-height))',
                padding: 'var(--space-8)',
                textAlign: 'center',
            }}
        >
            <Card className="placeholder-card" hover3D={false} glow>
                <div style={{ padding: 'var(--space-12) var(--space-8)' }}>
                    {/* Icon */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        style={{ fontSize: '4rem', marginBottom: 'var(--space-6)' }}
                    >
                        {icon}
                    </motion.div>

                    {/* Title */}
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.8rem',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-3)',
                    }}>
                        {title}
                    </h2>

                    {/* Description */}
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                        maxWidth: '360px',
                        marginBottom: 'var(--space-6)',
                        lineHeight: 1.7,
                    }}>
                        {description}
                    </p>

                    {/* Coming Soon Badge */}
                    <motion.span
                        animate={{
                            boxShadow: [
                                '0 0 5px var(--glow)',
                                '0 0 20px var(--glow)',
                                '0 0 5px var(--glow)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            display: 'inline-block',
                            padding: '8px 20px',
                            background: 'rgba(242, 167, 195, 0.1)',
                            border: '1px solid var(--accent-pink)',
                            borderRadius: 'var(--radius-pill)',
                            color: 'var(--accent-pink)',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 500,
                        }}
                    >
                        ✨ {comingSoonLabel}
                    </motion.span>

                    {/* Decorative stars */}
                    <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        {[...Array(5)].map((_, i) => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}
                            >
                                ⭐
                            </motion.span>
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

/* Individual Page Components */
export const ChatPage: React.FC = () => (
    <PlaceholderPage
        title="Whisper"
        icon="💬"
        description="A cozy chat space where every message feels like a warm whisper across the miles."
    />
);

export const CalendarPage: React.FC = () => (
    <PlaceholderPage
        title="Our Days"
        icon="📅"
        description="Count down the days until we're together again, with every shared moment marked."
    />
);

export const MapPage: React.FC = () => (
    <PlaceholderPage
        title="Between Us"
        icon="🗺️"
        description="Watch the little light travel from my city to yours — love in transit."
    />
);

export const MusicPage: React.FC = () => (
    <PlaceholderPage
        title="Our Song"
        icon="🎵"
        description="Play our favorite songs at the same time — together, even when apart."
    />
);

export const GalleryPage: React.FC = () => (
    <PlaceholderPage
        title="Us"
        icon="📸"
        description="A gallery of our most precious memories, frozen in time."
    />
);

export const LettersPage: React.FC = () => (
    <PlaceholderPage
        title="Letters to You"
        icon="💌"
        description="Write love letters sealed with a wax stamp — because some words deserve to be special."
    />
);

export const GamesPage: React.FC = () => (
    <PlaceholderPage
        title="Play Together"
        icon="🎮"
        description="Quizzes, doodles, and wishes — little games to keep the spark alive."
    />
);
