import React from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';

const SurprisesHub: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: 'var(--space-4)',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                <motion.h1 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '3rem',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)',
                        textShadow: '0 0 20px rgba(242, 167, 195, 0.4)'
                    }}
                >
                    🎁 Hidden Moments
                </motion.h1>
                <p style={{ 
                    fontFamily: 'var(--font-body)', 
                    color: 'var(--accent-lavender)',
                    fontSize: '1.1rem',
                    opacity: 0.8
                }}>
                    A little curiosity goes a long way... ✨
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {/* Empty State / Coming Soon Cards */}
                <Card glow={true}>
                    <div style={{ 
                        padding: 'var(--space-8)', 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(242, 167, 195, 0.5))' }}>🔒</div>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>A Secret Waiting...</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Something special is brewing here. Keep an eye out for a light leak from the edges!
                        </p>
                        <motion.div 
                            style={{ 
                                width: '40px', 
                                height: '2px', 
                                background: 'linear-gradient(90deg, transparent, var(--accent-pink), transparent)' 
                            }}
                            animate={{ opacity: [0.3, 1, 0.3], width: ['40px', '80px', '40px'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                </Card>

                <Card glow={false}>
                    <div style={{ 
                        padding: 'var(--space-8)', 
                        textAlign: 'center',
                        opacity: 0.6
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌑</div>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Under the Moonlight</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            More surprises will reveal themselves in time.
                        </p>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default SurprisesHub;
