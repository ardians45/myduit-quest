'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '@/stores';

export default function Home() {
  const router = useRouter();
  const { isOnboarded } = useBudgetStore();
  
  useEffect(() => {
    if (isOnboarded) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [isOnboarded, router]);
  
  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg text-white transform hover:scale-105 transition-transform animate-float">
          <span className="material-symbols-outlined text-4xl">fort</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">MyDuit Quest</h1>
        <p className="text-gray-500 font-medium mt-1">Memuat...</p>
      </div>
    </div>
  );
}
