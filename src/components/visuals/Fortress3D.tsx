'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface Fortress3DProps {
  level?: number;
  hp?: number;
  className?: string;
  showEffects?: boolean;
  activeDecorations?: string[];
}

export const Fortress3D: React.FC<Fortress3DProps> = ({ 
  level = 1, 
  hp = 100, 
  className = '', 
  showEffects = true,
  activeDecorations = [],
}) => {
  // Unique prefix for SVG IDs to avoid conflicts when multiple instances exist
  const uid = useId().replace(/:/g, '');

  // --- STATE LOGIC ---
  const isHealthy = hp > 60;
  const isCritical = hp <= 25;
  const isDestroyed = hp <= 0;

  const hasDecor = (id: string) => activeDecorations.includes(id);

  // Dynamic Colors
  const theme = {
    grassTop: isCritical ? '#44403c' : '#4ade80',
    grassBottom: isCritical ? '#292524' : '#16a34a',
    dirtTop: isCritical ? '#292524' : '#a8a29e',
    dirtBottom: isCritical ? '#1c1917' : '#57534e',
    wallLight: isCritical ? '#57534e' : '#f3f4f6',
    wallDark: isCritical ? '#44403c' : '#d1d5db',
    roofLight: isCritical ? '#7f1d1d' : '#fbbf24',
    roofDark: isCritical ? '#450a0a' : '#d97706',
    waterLight: isCritical ? '#ef4444' : '#60a5fa',
    waterDark: isCritical ? '#991b1b' : '#2563eb',
  };

  // Helper to make unique urls
  const u = (name: string) => `url(#${uid}${name})`;
  const fid = (name: string) => `${uid}${name}`;

  // --- SVG DEFINITIONS ---
  const Defs = () => (
    <defs>
      <linearGradient id={fid('grassGrad')} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.grassTop} />
        <stop offset="100%" stopColor={theme.grassBottom} />
      </linearGradient>
      <linearGradient id={fid('dirtGrad')} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.dirtTop} />
        <stop offset="100%" stopColor={theme.dirtBottom} />
      </linearGradient>
      <linearGradient id={fid('wallGrad')} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.wallLight} />
        <stop offset="100%" stopColor={theme.wallDark} />
      </linearGradient>
      <linearGradient id={fid('roofGrad')} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.roofLight} />
        <stop offset="100%" stopColor={theme.roofDark} />
      </linearGradient>
      <linearGradient id={fid('waterGrad')} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.waterLight} />
        <stop offset="100%" stopColor={theme.waterDark} />
      </linearGradient>
      <linearGradient id={fid('towerGrad')} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.wallLight} />
        <stop offset="30%" stopColor={theme.wallLight} />
        <stop offset="100%" stopColor={theme.wallDark} />
      </linearGradient>

      <filter id={fid('glow-orange')} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id={fid('glow-blue')} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id={fid('drop-shadow')} x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.25"/>
      </filter>
    </defs>
  );

  // --- BASE ISLAND ---
  const BaseSite = () => (
    <g>
      <path d="M50 160 Q150 200 250 160 C230 220 170 250 150 240 C130 250 70 220 50 160 Z" fill={u('dirtGrad')} filter={u('drop-shadow')} />
      <path d="M40 140 Q150 180 260 140 V160 Q150 200 40 160 Z" fill={theme.dirtTop} />
      <path d="M40 140 Q150 180 260 140 V145 Q150 185 40 145 Z" fill={theme.grassBottom} />
      <ellipse cx="150" cy="135" rx="110" ry="45" fill={u('grassGrad')} filter={u('drop-shadow')} />
      <ellipse cx="120" cy="125" rx="40" ry="15" fill="#fef08a" opacity="0.1" />
      <ellipse cx="180" cy="145" rx="30" ry="10" fill="#fef08a" opacity="0.1" />
      {level >= 3 && (
        <g>
           <path d="M70 140 Q150 175 230 140 Q215 165 150 165 Q85 165 70 140" fill={u('waterGrad')} opacity="0.85">
              <animate attributeName="opacity" values="0.7;0.9;0.7" dur="4s" repeatCount="indefinite" />
           </path>
           <path d="M90 145 Q150 170 210 145" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3">
             <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
           </path>
        </g>
      )}
    </g>
  );

  // --- MAIN KEEP ---
  const MainKeep = () => {
    const scale = level >= 5 ? 1.1 : 1;
    const yOffset = level >= 5 ? -5 : 0;
    return (
      <g transform={`translate(110, ${70 + yOffset}) scale(${scale})`} filter={u('drop-shadow')}>
        <ellipse cx="40" cy="65" rx="40" ry="15" fill="#000" opacity="0.25" />
        <rect x="10" y="20" width="60" height="45" rx="3" fill={u('wallGrad')} />
        <rect x="10" y="20" width="15" height="45" rx="0" fill={theme.wallLight} opacity="0.8" />
        {level >= 4 && (
          <g fill={theme.wallDark}>
            <rect x="8" y="15" width="10" height="5" />
            <rect x="22" y="15" width="10" height="5" />
            <rect x="36" y="15" width="10" height="5" />
            <rect x="50" y="15" width="10" height="5" />
            <rect x="64" y="15" width="10" height="5" />
          </g>
        )}
        <path d="M0 20 L40 -10 L80 20 Z" fill={u('roofGrad')} />
        <path d="M0 20 L40 -10 L40 20 Z" fill="#fff" opacity="0.15" />
        <path d="M30 65 L30 40 Q40 30 50 40 L50 65 Z" fill="#451a03" />
        <path d="M32 65 L32 42 Q40 34 48 42 L48 65 Z" fill="#78350f" />
        <circle cx="47" cy="52" r="1.5" fill="#fbbf24" />
        <g fill="#1e1b4b">
          <rect x="20" y="30" width="6" height="10" rx="3" />
          <rect x="54" y="30" width="6" height="10" rx="3" />
          {level >= 2 && <circle cx="40" cy="15" r="4" fill="#312e81" stroke="#9ca3af" strokeWidth="1.5" />}
        </g>
        {!isCritical && (
          <g fill="#fde047" opacity="0.8" filter={u('glow-orange')}>
             <rect x="21" y="32" width="4" height="6" rx="2" />
             <rect x="55" y="32" width="4" height="6" rx="2" />
          </g>
        )}
      </g>
    );
  };

  const WallSegment = ({ x = 0, y = 0, scale = 1, width = 45 }: { x?: number, y?: number, scale?: number, width?: number }) => (
    <g transform={`translate(${x}, ${90 + y}) scale(${scale})`} filter={u('drop-shadow')}>
      <rect x="0" y="0" width={width} height="35" rx="2" fill={u('wallGrad')} />
      <rect x="0" y="0" width={width} height="4" fill={theme.wallLight} />
      <rect x="0" y="0" width="8" height="35" fill="#fff" opacity="0.1" />
      <g fill={u('wallGrad')}>
         {Array.from({ length: Math.floor(width / 14) }).map((_, i) => (
           <rect key={i} x={2 + i * 14} y="-6" width="10" height="6" />
         ))}
      </g>
      <g stroke={theme.wallDark} strokeWidth="1" opacity="0.5">
        <line x1="10" y1="12" x2="20" y2="12" />
        <line x1="25" y1="22" x2="35" y2="22" />
        <line x1="5" y1="28" x2="15" y2="28" />
      </g>
    </g>
  );

  const CircularTower = ({ x = 0, y = 0, height = 70 }: { x?: number, y?: number, height?: number }) => (
    <g transform={`translate(${x}, ${y})`} filter={u('drop-shadow')}>
       <ellipse cx="15" cy={height + 5} rx="18" ry="7" fill="#000" opacity="0.3" />
       <rect x="0" y="10" width="30" height={height} rx="2" fill={u('towerGrad')} />
       <rect x="-2" y="5" width="34" height="8" rx="1" fill={theme.wallDark} />
       <rect x="-2" y="5" width="34" height="2" fill={theme.wallLight} />
       <path d="M-5 5 L15 -25 L35 5 Z" fill={u('roofGrad')} />
       <path d="M-5 5 L15 -25 L15 5 Z" fill="#fff" opacity="0.2" />
       <line x1="15" y1="-25" x2="15" y2="-40" stroke="#9ca3af" strokeWidth="2" />
       <rect x="12" y="25" width="6" height="12" rx="3" fill="#1e1b4b" />
       {!isCritical && <rect x="13" y="27" width="4" height="8" rx="2" fill="#fde047" opacity="0.8" filter={u('glow-orange')} />}
    </g>
  );

  const EntranceGate = () => (
    <g transform="translate(120, 105)" filter={u('drop-shadow')}>
       <path d="M0 45 V0 Q30 -25 60 0 V45 H50 V15 Q30 0 10 15 V45 Z" fill={u('wallGrad')} />
       <path d="M10 45 V15 Q30 0 50 15 V45 Z" fill="#1c1917" />
       <g stroke="#4b5563" strokeWidth="2.5">
         <line x1="15" y1="5" x2="15" y2="45" />
         <line x1="25" y1="0" x2="25" y2="45" />
         <line x1="35" y1="0" x2="35" y2="45" />
         <line x1="45" y1="5" x2="45" y2="45" />
         <line x1="10" y1="15" x2="50" y2="15" />
         <line x1="10" y1="25" x2="50" y2="25" />
         <line x1="10" y1="35" x2="50" y2="35" />
       </g>
    </g>
  );

  // ===== DECORATIONS =====
  const FlagDecor = ({ x, y, color = "#ef4444", goldStar = false }: { x: number, y: number, color?: string, goldStar?: boolean }) => (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M0 0 Q 15 5, 30 0 L 0 18 Z" fill={color}>
         <animate attributeName="d" values="M0 0 Q 15 5, 30 0 L 0 18 Z; M0 0 Q 15 -5, 30 0 L 0 18 Z; M0 0 Q 15 5, 30 0 L 0 18 Z" dur="2s" repeatCount="indefinite" />
      </path>
      {goldStar && (
         <path d="M12 6 l2 -4 l2 4 l4 1 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 z" fill="#fbbf24" transform="scale(0.5) translate(10, 8)" />
      )}
    </g>
  );

  const PremiumTorch = ({ x, y, isBlue = false }: { x: number, y: number, isBlue?: boolean }) => {
    const flameColor = isBlue ? '#60a5fa' : '#fb923c';
    const coreColor = isBlue ? '#fff' : '#fef08a';
    const filterRef = isBlue ? u('glow-blue') : u('glow-orange');
    return (
      <g transform={`translate(${x}, ${y})`}>
        <path d="M0 0 L6 12 L-6 12 Z" fill="#374151" />
        <rect x="-2" y="12" width="4" height="4" fill="#fbbf24" />
        <path d="M0 -10 Q-6 -2, 0 3 Q6 -2, 0 -10 Z" fill={flameColor} filter={filterRef}>
           <animate attributeName="d" values="M0 -10 Q-6 -2, 0 3 Q6 -2, 0 -10 Z; M0 -12 Q-4 -2, 0 3 Q4 -2, 0 -12 Z; M0 -10 Q-6 -2, 0 3 Q6 -2, 0 -10 Z" dur="0.5s" repeatCount="indefinite" />
        </path>
        <circle cx="0" cy="-2" r="2" fill={coreColor}>
          <animate attributeName="r" values="1.5;2.5;1.5" dur="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="-15" r="1" fill={flameColor} opacity="0">
           <animate attributeName="cy" values="-5;-25" dur="1.2s" repeatCount="indefinite" />
           <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  };

  const PremiumFountain = () => (
    <g transform="translate(200, 110)" filter={u('drop-shadow')}>
      <ellipse cx="15" cy="22" rx="22" ry="8" fill="#64748b" />
      <ellipse cx="15" cy="20" rx="22" ry="8" fill="#94a3b8" />
      <ellipse cx="15" cy="19" rx="18" ry="6" fill={u('waterGrad')} filter={u('glow-blue')} opacity="0.9">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <path d="M10 20 L12 5 H18 L20 20 Z" fill="#cbd5e1" />
      <ellipse cx="15" cy="5" rx="8" ry="3" fill="#94a3b8" />
      <path d="M13 5 Q15 -5, 17 5" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.8">
         <animate attributeName="d" values="M13 5 Q15 -5, 17 5; M13 5 Q15 -8, 17 5; M13 5 Q15 -5, 17 5" dur="0.8s" repeatCount="indefinite" />
      </path>
      {[0, 1, 2].map((i) => {
        const seed = (i * 137) % 10;
        return (
          <circle key={i} cx={10 + seed} cy={10} r="1.5" fill="#bfdbfe" opacity="0">
            <animate attributeName="cy" values="5;18" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        );
      })}
    </g>
  );

  const PremiumGarden = () => (
    <g transform="translate(65, 120)" filter={u('drop-shadow')}>
      <ellipse cx="20" cy="15" rx="25" ry="10" fill="#3f6212" opacity="0.6" />
      <circle cx="10" cy="10" r="8" fill="#166534" />
      <circle cx="12" cy="8" r="6" fill="#22c55e" />
      <circle cx="30" cy="12" r="7" fill="#14532d" />
      <circle cx="28" cy="9" r="5" fill="#4ade80" />
      {[
        { x: 15, y: 18, color: '#f472b6' },
        { x: 25, y: 16, color: '#a78bfa' },
        { x: 8, y: 15, color: '#fb923c' },
        { x: 32, y: 18, color: '#fcd34d' }
      ].map((flower, i) => (
         <g key={i} transform={`translate(${flower.x}, ${flower.y})`}>
           <line x1="0" y1="0" x2="0" y2="5" stroke="#22c55e" strokeWidth="1.5" />
           <circle cx="0" cy="0" r="3" fill={flower.color} filter={u('glow-orange')}>
              <animate attributeName="r" values="2.5;3.5;2.5" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
           </circle>
           <circle cx="0" cy="0" r="1" fill="#fff" />
         </g>
      ))}
    </g>
  );

  return (
    <div className={`relative flex items-center justify-center w-full h-full overflow-visible ${className} ${isDestroyed ? 'grayscale opacity-70' : ''}`}>
      <motion.svg
        viewBox="0 0 300 260"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
        initial={{ y: 0 }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Defs />

        {/* LAYER 1: BASE */}
        <BaseSite />

        {/* LAYER 2: BACK TOWERS & WALLS */}
        {level >= 3 && <CircularTower x={60} y={40} height={60} />}
        {level >= 3 && <CircularTower x={210} y={40} height={60} />}
        {level >= 2 && <WallSegment x={90} y={-10} scale={0.9} width={120} />}

        {/* LAYER 3: MAIN KEEP */}
        <MainKeep />

        {/* LAYER 4: FRONT DEFENSES */}
        {level >= 2 && <WallSegment x={40} width={80} />}
        {level >= 2 && <WallSegment x={180} width={80} />}
        {level >= 4 && <EntranceGate />}
        {level >= 5 && <CircularTower x={30} y={80} height={50} />}
        {level >= 5 && <CircularTower x={240} y={80} height={50} />}

        {/* LAYER 5: GROUND DECORATIONS */}
        {hasDecor('garden') && <PremiumGarden />}
        {hasDecor('fountain') && <PremiumFountain />}

        {/* LAYER 6: STRUCTURE DECORATIONS */}
        {level >= 3 && hasDecor('red_flag') && (
           <><FlagDecor x={75} y={15} color="#ef4444" /><FlagDecor x={225} y={15} color="#ef4444" /></>
        )}
        {level >= 3 && hasDecor('blue_flag') && (
           <><FlagDecor x={75} y={15} color="#3b82f6" /><FlagDecor x={225} y={15} color="#3b82f6" /></>
        )}
        {level >= 3 && hasDecor('gold_flag') && (
           <><FlagDecor x={75} y={15} color="#fbbf24" goldStar /><FlagDecor x={225} y={15} color="#fbbf24" goldStar /></>
        )}
        {level >= 2 && hasDecor('wall_torch') && (
          <><PremiumTorch x={110} y={140} /><PremiumTorch x={190} y={140} /></>
        )}
        {level >= 2 && hasDecor('blue_torch') && (
          <><PremiumTorch x={110} y={140} isBlue /><PremiumTorch x={190} y={140} isBlue /></>
        )}
        {hasDecor('royal_banner') && (
          <g transform="translate(150, 75)">
            <line x1="0" y1="0" x2="0" y2="25" stroke="#92400e" strokeWidth="2" />
            <path d="M-8 0 H8 V20 L0 15 L-8 20 Z" fill="#7c3aed" filter={u('drop-shadow')} />
            <path d="M-8 0 H8 V3 Z" fill="#fbbf24" />
            <circle cx="0" cy="8" r="3" fill="#fbbf24" />
          </g>
        )}

        {/* LAYER 7: PARTICLE EFFECTS */}
        {isHealthy && showEffects && (
           <g filter={u('glow-blue')}>
             {[0, 1, 2, 3, 4].map((i) => {
                const rCx = (i * 47) % 200;
                const rR = (i * 17) % 2 + 1;
                const rDur = 3 + ((i * 23) % 4);
                return (
                  <circle key={i} cx={50 + rCx} cy={200} r={rR} fill="#a78bfa" opacity="0">
                     <animate attributeName="cy" values="200; 50" dur={`${rDur}s`} repeatCount="indefinite" begin={`${i * 1.2}s`} />
                     <animate attributeName="opacity" values="0; 0.8; 0" dur={`${rDur}s`} repeatCount="indefinite" begin={`${i * 1.2}s`} />
                  </circle>
                );
             })}
           </g>
        )}
        {isCritical && showEffects && (
           <g filter={u('glow-orange')}>
             {[0, 1, 2, 3, 4, 5].map((i) => {
                const rCx = (i * 61) % 100;
                const rCx2 = 80 + ((i * 73) % 140);
                const rR = (i * 19) % 2 + 1;
                const rDur = 1 + ((i * 31) % 2);
                return (
                  <circle key={i} cx={100 + rCx} cy={150} r={rR} fill="#ef4444" opacity="0">
                     <animate attributeName="cy" values="150; 50" dur={`${rDur}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
                     <animate attributeName="cx" values={`${100 + rCx}; ${rCx2}`} dur={`${rDur}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
                     <animate attributeName="opacity" values="0; 1; 0" dur={`${rDur}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
                  </circle>
                );
             })}
           </g>
        )}

      </motion.svg>
      {/* Level Badge */}
      <div className="absolute top-0 right-0 md:top-4 md:right-4 bg-gradient-to-r from-primary to-primary-dark backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-[0_4px_20px_rgba(167,139,250,0.4)] border border-white/20 z-20 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">star</span>
        LV. {level}
      </div>
    </div>
  );
};
