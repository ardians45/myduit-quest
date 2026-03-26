'use client';

import { useRouter, usePathname } from 'next/navigation';

export const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/60 pb-6 pt-2 z-30 shadow-[0_-10px_40px_-10px_rgba(147,51,234,0.05)]">
      <div className="flex justify-between items-end max-w-md mx-auto px-6">
        
        {/* Beranda */}
        <button 
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 p-2 relative min-w-[60px] transition-colors cursor-pointer ${
            isActive('/dashboard') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isActive('/dashboard') && (
            <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#9333ea]"></div>
          )}
          <span className={`material-symbols-outlined text-[26px] ${isActive('/dashboard') ? 'fill animate-pulse-slow' : ''}`}>
            home
          </span>
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        
        {/* Statistik */}
        <button 
          onClick={() => router.push('/stats')}
          className={`flex flex-col items-center gap-1 p-2 relative min-w-[60px] transition-colors cursor-pointer ${
            isActive('/stats') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isActive('/stats') && (
            <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#9333ea]"></div>
          )}
          <span className={`material-symbols-outlined text-[26px] ${isActive('/stats') ? 'fill' : ''}`}>
            bar_chart
          </span>
          <span className="text-[10px] font-bold">Statistik</span>
        </button>
        
        <div className="w-12"></div> {/* Spacer for FAB */}
        
        {/* Benteng */}
        <button 
          onClick={() => router.push('/battle')}
          className={`flex flex-col items-center gap-1 p-2 relative min-w-[60px] transition-colors cursor-pointer ${
            isActive('/battle') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isActive('/battle') && (
            <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#9333ea]"></div>
          )}
          <span className={`material-symbols-outlined text-[26px] ${isActive('/battle') ? 'fill' : ''}`}>
            fort
          </span>
          <span className="text-[10px] font-bold">Benteng</span>
        </button>
        
        {/* Profil */}
        <button 
          onClick={() => router.push('/profile')}
          className={`flex flex-col items-center gap-1 p-2 relative min-w-[60px] transition-colors cursor-pointer ${
            isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isActive('/profile') && (
            <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#9333ea]"></div>
          )}
          <span className={`material-symbols-outlined text-[26px] ${isActive('/profile') ? 'fill' : ''}`}>
            person
          </span>
          <span className="text-[10px] font-bold">Profil</span>
        </button>

      </div>
    </nav>
  );
};
