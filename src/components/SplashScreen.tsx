import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Add a small delay for fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-primary flex flex-col items-center justify-center z-50 opacity-0 transition-opacity duration-500 pointer-events-none">
        {/* Content here for fade out effect */}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-primary flex flex-col items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center space-y-6 px-6 animate-in fade-in duration-1000">
        {/* Main Brand Text */}
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-wider">
          LASTBENCH
        </h1>
        
        {/* Slogan */}
        <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
          Ena Mapla Pesalama
        </p>
        
        {/* Loading indicator */}
        <div className="flex justify-center mt-12">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse mx-2" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;