import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import chatIcon from '../../assets/chat-icon.png';
import calendarIcon from '../../assets/calendar-icon.png';
import mapIcon from '../../assets/map-icon.png';
import musicIcon from '../../assets/music-icon.png';
import galleryIcon from '../../assets/gallery-icon.png';
import gamesIcon from '../../assets/games-icon.png';
import lettersIcon from '../../assets/letters-icon.png';
import surprisesIcon from '../../assets/surprises-icon.png';

interface NavItem {
    path: string;
    icon: string;
    label: string;
    color: string;
    isImage?: boolean;
}

const navItems: NavItem[] = [
    { path: '/chat', icon: chatIcon, label: 'Whisper', color: '#F2A7C3', isImage: true },
    { path: '/calendar', icon: calendarIcon, label: 'Our Days', color: '#81B1EE', isImage: true },
    { path: '/map', icon: mapIcon, label: 'Between Us', color: '#F5D380', isImage: true },
    { path: '/music', icon: musicIcon, label: 'Our Song', color: '#C4B1D4', isImage: true },
    { path: '/gallery', icon: galleryIcon, label: 'Us', color: '#AEE1C2', isImage: true },
    { path: '/letters', icon: lettersIcon, label: 'Letters', color: '#F2A7C3', isImage: true },
    { path: '/games', icon: gamesIcon, label: 'Play', color: '#F5D380', isImage: true },
    { path: '/surprises', icon: surprisesIcon, label: 'Surprises', color: '#C4B1D4', isImage: true },
];

const SidebarItem = ({ item, isActive }: { item: NavItem, isActive: boolean }) => {
    // 3D Tilt calculation
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-50, 50], [15, -15]);
    const rotateY = useTransform(x, [-50, 50], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <NavLink to={item.path} style={{ textDecoration: 'none' }}>
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: '56px',
                    height: '56px',
                    perspective: '1000px',
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d',
                        width: '100%',
                        height: '100%',
                        borderRadius: '16px',
                        background: isActive ? `rgba(255,255,255,0.08)` : 'rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(12px)',
                        border: `0.5px solid ${isActive ? item.color + '40' : 'rgba(255, 255, 255, 0.04)'}`,
                        boxShadow: isActive 
                            ? `0 8px 16px rgba(0,0,0,0.3), inset 0 0 10px ${item.color}20` 
                            : '0 4px 10px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                    }}
                >
                    {/* Floating completely off the glass plane */}
                    <motion.div
                        style={{
                            fontSize: item.isImage ? '0' : '1.6rem',
                            transform: 'translateZ(25px)',
                            textShadow: isActive ? `0 0 15px ${item.color}` : 'none',
                            filter: isActive ? 'brightness(1.2)' : 'brightness(0.8)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        {item.isImage ? (
                            <img 
                                src={item.icon} 
                                alt={item.label} 
                                style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    objectFit: 'contain',
                                    filter: isActive ? 'drop-shadow(0 0 10px rgba(242, 167, 195, 0.4))' : 'none'
                                }} 
                            />
                        ) : (
                            item.icon
                        )}
                    </motion.div>
                </motion.div>

                {/* Active indicator strip */}
                {isActive && (
                    <motion.div
                        layoutId="activeNavStrip"
                        style={{
                            position: 'absolute',
                            left: '-4px',
                            top: '15%',
                            height: '70%',
                            width: '3px',
                            borderRadius: '4px',
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}, 0 0 4px ${item.color}`,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                )}

                {/* Glassmorphic Tooltip */}
                <motion.span
                    className="nav-tooltip"
                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                    whileHover={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{
                        position: 'absolute',
                        left: '70px',
                        background: 'rgba(11, 14, 26, 0.7)',
                        backdropFilter: 'blur(10px)',
                        color: 'var(--text-primary)',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: `1px solid ${item.color}40`,
                        boxShadow: `0 8px 16px rgba(0,0,0,0.4), 0 0 10px ${item.color}20`,
                        zIndex: 200,
                        textTransform: 'uppercase'
                    }}
                >
                    {item.label}
                </motion.span>
            </motion.div>
        </NavLink>
    );
};

const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="app-sidebar" style={{
            background: 'transparent', // The global canvas shines through
            borderRight: '0.5px solid rgba(255, 255, 255, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 'var(--space-6)',
            gap: 'var(--space-4)',
            width: '80px',
            zIndex: 100
        }}>
            {/* Drifting 3D Logo */}
            <motion.div
                className="sidebar-logo"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1, rotate: 15 }}
                style={{
                    fontSize: '2.5rem',
                    marginBottom: 'var(--space-6)',
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 0 15px rgba(245, 211, 128, 0.8))',
                }}
            >
                🌙
            </motion.div>

            <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path === '/chat' && location.pathname === '/');
                    return <SidebarItem key={item.path} item={item} isActive={isActive} />;
                })}
            </div>
        </nav>
    );
};

export default Sidebar;
