'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function ProBadge({ size = 'sm' }: ProBadgeProps) {
  const sizeStyles = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 ${sizeStyles[size]} bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-black rounded-lg shadow-sm`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px' }}>
        workspace_premium
      </span>
      PRO
    </motion.div>
  );
}
