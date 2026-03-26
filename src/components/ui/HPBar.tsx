'use client';

import { motion } from 'framer-motion';

interface HPBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function HPBar({ 
  percentage, 
  showLabel = false, 
  size = 'md',
  animate = true 
}: HPBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  const getStatus = () => {
    if (clampedPercentage > 50) return 'safe';
    if (clampedPercentage > 25) return 'warning';
    return 'danger';
  };
  
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
  
  const status = getStatus();
  
  return (
    <div className="w-full">
      <div className={`hp-bar ${sizeStyles[size]}`}>
        <motion.div
          className={`hp-bar-fill ${status}`}
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-sm">
          <span className={`font-medium ${
            status === 'safe' ? 'text-success' :
            status === 'warning' ? 'text-warning' : 'text-danger'
          }`}>
            {clampedPercentage}% HP
          </span>
        </div>
      )}
    </div>
  );
}
