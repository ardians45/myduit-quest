'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function Card({
  children,
  className = '',
  variant = 'glass',
  padding = 'md',
  animate = true,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const variantStyles = {
    glass: 'card-glass',
    solid: 'bg-bg-card rounded-2xl shadow-md',
    outline: 'bg-transparent border-2 border-primary/20 rounded-2xl',
  };
  
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};
  
  return (
    <Component
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}
