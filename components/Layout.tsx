
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "One More Bite", onBack }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#F9F9F9] relative overflow-hidden">
      {/* iOS Minimal Header */}
      <header className="sticky top-0 z-30 bg-[#F9F9F9]/60 backdrop-blur-md px-6 pt-14 pb-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="w-20">
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center text-zinc-400 hover:text-orange-500 font-medium transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
          </div>
          
          <h1 className="text-sm font-bold tracking-tight text-center flex-1 uppercase text-zinc-400">{title}</h1>
          
          <div className="w-20 flex justify-end">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <div className="h-8 safe-bottom" />
    </div>
  );
};

export default Layout;
