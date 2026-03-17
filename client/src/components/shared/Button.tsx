import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    accent: 'btn-accent',
};

const sizeStyles: Record<string, string> = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
};

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`btn ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </motion.button>
    );
};

export default Button;
