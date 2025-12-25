import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function ImageWithLoader({ 
  src, 
  alt, 
  className = '', 
  size = 'w500',
  fallbackSrc = null,
  aspectRatio = '2/3'
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Placeholder logo do PrimeCine
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect fill="%231a1a1a" width="400" height="600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%236A0DAD"%3EPrimeCine%3C/text%3E%3C/svg%3E';

  const imageUrl = src 
    ? `${IMAGE_BASE}/${size}${src}`
    : (fallbackSrc || placeholderImage);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gray-900 ${className}`}
      style={{ aspectRatio }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      )}
      
      <img
        src={error ? placeholderImage : imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <div className="text-center p-4">
            <div className="text-purple-500 font-bold text-2xl mb-2">PrimeCine</div>
            <div className="text-gray-400 text-xs">Imagem não disponível</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageWithLoader;
