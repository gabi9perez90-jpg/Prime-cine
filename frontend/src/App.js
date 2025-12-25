import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import SplashScreen from '@/components/SplashScreen';

import HomePage from '@/pages/HomePage';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import TVDetailsPage from '@/pages/TVDetailsPage';
import VideoPlayerPage from '@/pages/VideoPlayerPage';
import SearchPage from '@/pages/SearchPage';
import SearchResultsPage from '@/pages/SearchResultsPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // Detectar se é Android TV ou dispositivo com controle remoto
    const isTV = window.matchMedia('(hover: none)').matches || 
                 navigator.userAgent.includes('TV') ||
                 window.screen.width >= 1920;
    
    if (isTV) {
      // Adicionar classe ao body para estilos específicos de TV
      document.body.classList.add('tv-mode');
      
      // Configurar navegação com D-Pad
      const handleKeyDown = (e) => {
        const focusableElements = Array.from(
          document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [data-focusable="true"]'
          )
        ).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        switch(e.keyCode) {
          case 37: // Left Arrow
            e.preventDefault();
            if (currentIndex > 0) {
              focusableElements[currentIndex - 1].focus();
            }
            break;
            
          case 38: // Up Arrow
            e.preventDefault();
            if (currentIndex > 0) {
              // Navegar para o elemento mais próximo acima
              const current = document.activeElement.getBoundingClientRect();
              const above = focusableElements
                .slice(0, currentIndex)
                .reverse()
                .find(el => {
                  const rect = el.getBoundingClientRect();
                  return rect.bottom <= current.top;
                });
              if (above) above.focus();
            }
            break;
            
          case 39: // Right Arrow
            e.preventDefault();
            if (currentIndex < focusableElements.length - 1) {
              focusableElements[currentIndex + 1].focus();
            }
            break;
            
          case 40: // Down Arrow
            e.preventDefault();
            if (currentIndex < focusableElements.length - 1) {
              // Navegar para o elemento mais próximo abaixo
              const current = document.activeElement.getBoundingClientRect();
              const below = focusableElements
                .slice(currentIndex + 1)
                .find(el => {
                  const rect = el.getBoundingClientRect();
                  return rect.top >= current.bottom;
                });
              if (below) below.focus();
            }
            break;
            
          case 13: // Enter/Select
          case 32: // Space
            e.preventDefault();
            if (document.activeElement) {
              document.activeElement.click();
            }
            break;
            
          case 8: // Back button
          case 27: // Escape
            e.preventDefault();
            window.history.back();
            break;
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Focar no primeiro elemento ao carregar
      setTimeout(() => {
        const firstFocusable = document.querySelector('button, [href], input');
        if (firstFocusable) firstFocusable.focus();
      }, 500);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.classList.remove('tv-mode');
      };
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
          <Route path="/tv/:tvId" element={<TVDetailsPage />} />
          <Route path="/watch/movie/:movieId" element={<VideoPlayerPage type="movie" />} />
          <Route path="/watch/tv/:tvId/:season/:episode" element={<VideoPlayerPage type="tv" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/search/results" element={<SearchResultsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;