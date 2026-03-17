import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
    path: string;
    icon: string;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/chat', icon: '💬', label: 'Whisper' },
    { path: '/calendar', icon: '📅', label: 'Our Days' },
    { path: '/map', icon: '🗺️', label: 'Between Us' },
    { path: '/music', icon: '🎵', label: 'Our Song' },
    { path: '/gallery', icon: '📸', label: 'Us' },
    { path: '/letters', icon: '💌', label: 'Letters' },
    { path: '/games', icon: '🎮', label: 'Play' },
];

const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="app-sidebar" style={{
            background: 'var(--bg-secondary)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 'var(--space-6)',
            gap: 'var(--space-2)',
        }}>
            {/* Logo */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                style={{
                    fontSize: '1.8rem',
                    marginBottom: 'var(--space-6)',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 0 8px rgba(200, 208, 224, 0.5))',
                }}
            >
                🌙
            </motion.div>

            {/* Nav Items */}
            {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                    (item.path === '/chat' && location.pathname === '/');

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={{ textDecoration: 'none' }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-card)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                position: 'relative',
                                cursor: 'pointer',
                                background: isActive ? 'rgba(242, 167, 195, 0.12)' : 'transparent',
                                transition: 'background 0.2s ease',
                            }}
                        >
                            {item.icon}

                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    style={{
                                        position: 'absolute',
                                        left: '-4px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px',
                                        height: '24px',
                                        borderRadius: 'var(--radius-pill)',
                                        background: 'var(--accent-pink)',
                                        boxShadow: '0 0 8px var(--glow)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Tooltip */}
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                style={{
                                    position: 'absolute',
                                    left: '60px',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontFamily: 'var(--font-body)',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    border: 'var(--glass-border)',
                                    boxShadow: 'var(--shadow-card)',
                                    zIndex: 200,
                                }}
                            >
                                {item.label}
                            </motion.span>
                        </motion.div>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default Sidebar;
