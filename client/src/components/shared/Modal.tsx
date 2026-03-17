import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: { duration: 0.2 },
    },
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                    }}
                >
                    <motion.div
                        className={`modal-content ${className}`}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-lg)',
                            border: 'var(--glass-border)',
                            padding: 'var(--space-8)',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: 'var(--shadow-elevated)',
                        }}
                    >
                        {title && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 'var(--space-6)',
                            }}>
                                <h3 style={{
                                    fontFamily: 'var(--font-heading)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.3rem',
                                }}>{title}</h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        lineHeight: 1,
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
