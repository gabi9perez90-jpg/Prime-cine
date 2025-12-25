import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isTV, setIsTV] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Detect if TV based on screen size
    const screenWidth = window.innerWidth;
    const tvMode = screenWidth >= 768;
    setIsTV(tvMode);
    
    // Duration based on device
    const duration = tvMode ? 4000 : 2500;
    
    const timer = setTimeout(() => {
      onFinish();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onFinish]);
  
  // Import images dynamically based on device
  const splashImage = isTV 
    ? require('@/assets/splash_tv.png')
    : require('@/assets/splash_mobile.png');
  
  const loaderSize = isTV ? '60px' : '40px';
  
  return (
    <div className="splash-screen">
      <img 
        src={splashImage}
        alt="PrimeCine" 
        className="splash-image"
        onLoad={() => setImageLoaded(true)}
      />
      
      {!imageLoaded && (
        <div className="splash-loader-container">
          <div className="splash-loader" style={{ width: loaderSize, height: loaderSize }} />
        </div>
      )}
      
      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0B0B0B;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.6s ease-in;
          overflow: hidden;
        }
        
        .splash-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          animation: logoFadeZoom ${isTV ? '1s' : '0.6s'} ease-out;
        }
        
        .splash-loader-container {
          position: absolute;
          bottom: ${isTV ? '80px' : '60px'};
          left: 50%;
          transform: translateX(-50%);
        }
        
        .splash-loader {
          border: 4px solid rgba(155, 77, 255, 0.2);
          border-top: 4px solid #9B4DFF;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes logoFadeZoom {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* TV specific animation */
        ${isTV ? `
          .splash-image {
            animation: logoFadeZoom 1s ease-out, breathe 3s ease-in-out infinite 1s;
          }
          
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
        ` : ''}
      `}</style>
    </div>
  );
}

export default SplashScreen;
