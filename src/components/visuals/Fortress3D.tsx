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
    const scale = level >= 5 ? 1.05 : 1;
    const yOffset = level >= 5 ? -3 : 0;
    return (
      <g transform={`translate(115, ${72 + yOffset}) scale(${scale})`} filter={u('drop-shadow')}>
        <ellipse cx="35" cy="60" rx="35" ry="13" fill="#000" opacity="0.25" />
        <rect x="10" y="18" width="50" height="42" rx="3" fill={u('wallGrad')} />
        <rect x="10" y="18" width="12" height="42" rx="0" fill={theme.wallLight} opacity="0.8" />
        {level >= 4 && (
          <g fill={theme.wallDark}>
            <rect x="8" y="13" width="9" height="5" />
            <rect x="20" y="13" width="9" height="5" />
            <rect x="32" y="13" width="9" height="5" />
            <rect x="44" y="13" width="9" height="5" />
            <rect x="56" y="13" width="9" height="5" />
          </g>
        )}
        <path d="M0 18 L35 -8 L70 18 Z" fill={u('roofGrad')} />
        <path d="M0 18 L35 -8 L35 18 Z" fill="#fff" opacity="0.15" />
        <path d="M25 60 L25 38 Q35 28 45 38 L45 60 Z" fill="#451a03" />
        <path d="M27 60 L27 40 Q35 32 43 40 L43 60 Z" fill="#78350f" />
        <circle cx="42" cy="48" r="1.5" fill="#fbbf24" />
        <g fill="#1e1b4b">
          <rect x="17" y="28" width="6" height="10" rx="3" />
          <rect x="47" y="28" width="6" height="10" rx="3" />
          {level >= 2 && <circle cx="35" cy="13" r="4" fill="#312e81" stroke="#9ca3af" strokeWidth="1.5" />}
        </g>
        {!isCritical && (
          <g fill="#fde047" opacity="0.8" filter={u('glow-orange')}>
             <rect x="18" y="30" width="4" height="6" rx="2" />
             <rect x="48" y="30" width="4" height="6" rx="2" />
          </g>
        )}
      </g>
    );
  };

  const WallSegment = ({ x = 0, y = 0, scale = 1, width = 40 }: { x?: number, y?: number, scale?: number, width?: number }) => (
    <g transform={`translate(${x}, ${90 + y}) scale(${scale})`} filter={u('drop-shadow')}>
      <rect x="0" y="0" width={width} height="32" rx="2" fill={u('wallGrad')} />
      <rect x="0" y="0" width={width} height="4" fill={theme.wallLight} />
      <rect x="0" y="0" width="7" height="32" fill="#fff" opacity="0.1" />
      <g fill={u('wallGrad')}>
         {Array.from({ length: Math.floor(width / 14) }).map((_, i) => (
           <rect key={i} x={2 + i * 14} y="-5" width="9" height="5" />
         ))}
      </g>
      <g stroke={theme.wallDark} strokeWidth="1" opacity="0.5">
        <line x1="8" y1="11" x2="18" y2="11" />
        <line x1="22" y1="20" x2="32" y2="20" />
        <line x1="4" y1="26" x2="14" y2="26" />
      </g>
    </g>
  );

  const CircularTower = ({ x = 0, y = 0, height = 60 }: { x?: number, y?: number, height?: number }) => (
    <g transform={`translate(${x}, ${y})`} filter={u('drop-shadow')}>
       <ellipse cx="13" cy={height + 4} rx="15" ry="6" fill="#000" opacity="0.3" />
       <rect x="0" y="10" width="26" height={height} rx="2" fill={u('towerGrad')} />
       <rect x="-2" y="5" width="30" height="7" rx="1" fill={theme.wallDark} />
       <rect x="-2" y="5" width="30" height="2" fill={theme.wallLight} />
       <path d="M-4 5 L13 -22 L30 5 Z" fill={u('roofGrad')} />
       <path d="M-4 5 L13 -22 L13 5 Z" fill="#fff" opacity="0.2" />
       <line x1="13" y1="-22" x2="13" y2="-35" stroke="#9ca3af" strokeWidth="2" />
       <rect x="10" y="22" width="6" height="11" rx="3" fill="#1e1b4b" />
       {!isCritical && <rect x="11" y="24" width="4" height="7" rx="2" fill="#fde047" opacity="0.8" filter={u('glow-orange')} />}
    </g>
  );

  const EntranceGate = () => (
    <g transform="translate(125, 105)" filter={u('drop-shadow')}>
       <path d="M0 42 V0 Q25 -22 50 0 V42 H42 V14 Q25 0 8 14 V42 Z" fill={u('wallGrad')} />
       <path d="M8 42 V14 Q25 0 42 14 V42 Z" fill="#1c1917" />
       <g stroke="#4b5563" strokeWidth="2">
         <line x1="13" y1="5" x2="13" y2="42" />
         <line x1="21" y1="0" x2="21" y2="42" />
         <line x1="29" y1="0" x2="29" y2="42" />
         <line x1="37" y1="5" x2="37" y2="42" />
         <line x1="8" y1="14" x2="42" y2="14" />
         <line x1="8" y1="23" x2="42" y2="23" />
         <line x1="8" y1="32" x2="42" y2="32" />
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
    <g transform="translate(190, 112)" filter={u('drop-shadow')}>
      <ellipse cx="13" cy="20" rx="18" ry="7" fill="#64748b" />
      <ellipse cx="13" cy="18" rx="18" ry="7" fill="#94a3b8" />
      <ellipse cx="13" cy="17" rx="15" ry="5" fill={u('waterGrad')} filter={u('glow-blue')} opacity="0.9">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <path d="M9 18 L10 5 H16 L17 18 Z" fill="#cbd5e1" />
      <ellipse cx="13" cy="5" rx="7" ry="3" fill="#94a3b8" />
      <path d="M11 5 Q13 -4, 15 5" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.8">
         <animate attributeName="d" values="M11 5 Q13 -4, 15 5; M11 5 Q13 -7, 15 5; M11 5 Q13 -4, 15 5" dur="0.8s" repeatCount="indefinite" />
      </path>
      {[0, 1, 2].map((i) => {
        const seed = (i * 137) % 10;
        return (
          <circle key={i} cx={8 + seed} cy={10} r="1.5" fill="#bfdbfe" opacity="0">
            <animate attributeName="cy" values="5;16" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
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
        {level >= 3 && <CircularTower x={75} y={42} height={55} />}
        {level >= 3 && <CircularTower x={200} y={42} height={55} />}
        {level >= 2 && <WallSegment x={100} y={-10} scale={0.9} width={100} />}

        {/* LAYER 3: MAIN KEEP */}
        <MainKeep />

        {/* LAYER 4: FRONT DEFENSES */}
        {level >= 2 && <WallSegment x={55} width={70} />}
        {level >= 2 && <WallSegment x={175} width={70} />}
        {level >= 4 && <EntranceGate />}
        {level >= 5 && <CircularTower x={50} y={82} height={45} />}
        {level >= 5 && <CircularTower x={225} y={82} height={45} />}

        {/* LAYER 5: GROUND DECORATIONS */}
        {hasDecor('garden') && <PremiumGarden />}
        {hasDecor('fountain') && <PremiumFountain />}

        {/* LAYER 6: STRUCTURE DECORATIONS */}
        {hasDecor('red_flag') && (
           <><FlagDecor x={88} y={18} color="#ef4444" /><FlagDecor x={213} y={18} color="#ef4444" /></>
        )}
        {hasDecor('blue_flag') && (
           <><FlagDecor x={88} y={18} color="#3b82f6" /><FlagDecor x={213} y={18} color="#3b82f6" /></>
        )}
        {hasDecor('gold_flag') && (
           <><FlagDecor x={88} y={18} color="#fbbf24" goldStar /><FlagDecor x={213} y={18} color="#fbbf24" goldStar /></>
        )}
        {hasDecor('wall_torch') && (
          <><PremiumTorch x={115} y={138} /><PremiumTorch x={185} y={138} /></>
        )}
        {hasDecor('blue_torch') && (
          <><PremiumTorch x={115} y={138} isBlue /><PremiumTorch x={185} y={138} isBlue /></>
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
    </div>
  );
};
