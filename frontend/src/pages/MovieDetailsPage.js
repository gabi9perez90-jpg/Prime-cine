import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Star, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`${API}/movies/${movieId}`);
      setMovie(response.data);
      
      // Find trailer
      const trailers = response.data.videos.filter(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailers.length > 0) {
        setTrailer(trailers[0]);
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes do filme');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = () => {
    navigate(`/watch/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path ? `${IMAGE_BASE}/original${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path ? `${IMAGE_BASE}/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : 'N/A';

  return (
    <div className="min-h-screen bg-black">
      {/* Background Video/Image */}
      <div className="relative h-screen">
        {trailer ? (
          <div className="absolute inset-0">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&showinfo=0&modestbranding=1`}
              title="Trailer"
              className="w-full h-full object-cover scale-125"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : backdropUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : null}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
              {/* Poster */}
              <div className="hidden md:block">
                <img 
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" data-testid="movie-title">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {movie.vote_average > 0 && (
                    <Badge className="bg-yellow-600 border-0 text-lg px-3 py-1">
                      <Star className="h-4 w-4 mr-1" fill="currentColor" />
                      {movie.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  {movie.release_date && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-base">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(movie.release_date).getFullYear()}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-600 text-gray-300 text-base">
                    <Clock className="h-4 w-4 mr-1" />
                    {runtime}
                  </Badge>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map(genre => (
                      <Badge key={genre.id} className="bg-purple-600/50 border-0">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-lg text-gray-300 leading-relaxed max-w-3xl" data-testid="movie-overview">
                  {movie.overview}
                </p>

                <Button
                  onClick={handleWatch}
                  className="bg-purple-600 hover:bg-purple-700 text-xl px-12 py-7 font-semibold"
                  data-testid="watch-button"
                >
                  <Play className="h-6 w-6 mr-2" fill="currentColor" />
                  Assistir Agora
                </Button>

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-3">Elenco</h3>
                    <div className="flex flex-wrap gap-3">
                      {movie.cast.slice(0, 5).map(person => (
                        <div key={person.id} className="text-gray-300 text-sm">
                          {person.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsPage;