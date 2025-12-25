import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function TVDetailsPage() {
  const { tvId } = useParams();
  const navigate = useNavigate();
  const [tvShow, setTvShow] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTVDetails();
  }, [tvId]);

  useEffect(() => {
    if (tvShow && selectedSeason) {
      fetchSeasonDetails();
    }
  }, [selectedSeason, tvShow]);

  const fetchTVDetails = async () => {
    try {
      const response = await axios.get(`${API}/tv/${tvId}`);
      setTvShow(response.data);
      setSelectedSeason(1);
      
      // Find trailer
      const trailers = response.data.videos.filter(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailers.length > 0) {
        setTrailer(trailers[0]);
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes da série');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonDetails = async () => {
    try {
      const response = await axios.get(`${API}/tv/${tvId}/season/${selectedSeason}`);
      setSeasonDetails(response.data);
    } catch (error) {
      console.error('Error fetching season details:', error);
    }
  };

  const handleEpisodeClick = (episodeNumber) => {
    navigate(`/watch/tv/${tvId}/${selectedSeason}/${episodeNumber}`);
  };

  const handleWatchFirst = () => {
    navigate(`/watch/tv/${tvId}/1/1`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!tvShow) return null;

  const backdropUrl = tvShow.backdrop_path ? `${IMAGE_BASE}/original${tvShow.backdrop_path}` : null;
  const posterUrl = tvShow.poster_path ? `${IMAGE_BASE}/w500${tvShow.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

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
                  alt={tvShow.name}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" data-testid="tv-title">
                    {tvShow.name}
                  </h1>
                  {tvShow.tagline && (
                    <p className="text-xl text-gray-300 italic mb-4">{tvShow.tagline}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {tvShow.vote_average > 0 && (
                    <Badge className="bg-yellow-600 border-0 text-lg px-3 py-1">
                      <Star className="h-4 w-4 mr-1" fill="currentColor" />
                      {tvShow.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  {tvShow.first_air_date && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-base">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(tvShow.first_air_date).getFullYear()}
                    </Badge>
                  )}
                  {tvShow.number_of_seasons && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-base">
                      {tvShow.number_of_seasons} Temporada{tvShow.number_of_seasons > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {tvShow.genres && tvShow.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tvShow.genres.map(genre => (
                      <Badge key={genre.id} className="bg-purple-600/50 border-0">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-lg text-gray-300 leading-relaxed max-w-3xl" data-testid="tv-overview">
                  {tvShow.overview}
                </p>

                <Button
                  onClick={handleWatchFirst}
                  className="bg-purple-600 hover:bg-purple-700 text-xl px-12 py-7 font-semibold"
                  data-testid="watch-button"
                >
                  <Play className="h-6 w-6 mr-2" fill="currentColor" />
                  Assistir Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Episódios</h2>
          {tvShow.seasons && tvShow.seasons.length > 0 && (
            <Select value={selectedSeason.toString()} onValueChange={(val) => setSelectedSeason(parseInt(val))}>
              <SelectTrigger className="w-[200px] bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Selecione a temporada" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {tvShow.seasons
                  .filter(s => s.season_number > 0)
                  .map(season => (
                    <SelectItem key={season.id} value={season.season_number.toString()} className="text-white">
                      Temporada {season.season_number}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {seasonDetails && seasonDetails.episodes && (
          <div className="grid gap-4">
            {seasonDetails.episodes.map(episode => (
              <Card 
                key={episode.id}
                className="bg-gray-900 border-gray-800 overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => handleEpisodeClick(episode.episode_number)}
                data-testid={`episode-card-${episode.episode_number}`}
              >
                <div className="grid md:grid-cols-[300px_1fr] gap-4">
                  <div className="relative aspect-video md:aspect-auto md:h-40">
                    <img 
                      src={episode.still_path ? `${IMAGE_BASE}/w500${episode.still_path}` : 'https://via.placeholder.com/500x281?text=No+Image'}
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {episode.runtime && (
                        <Badge variant="outline" className="border-gray-700 text-gray-400">
                          {episode.runtime}min
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{episode.overview}</p>
                    {episode.air_date && (
                      <p className="text-gray-500 text-xs mt-2">
                        Lançado em: {new Date(episode.air_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TVDetailsPage;