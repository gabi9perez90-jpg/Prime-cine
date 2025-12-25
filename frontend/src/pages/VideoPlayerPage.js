import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, Settings } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function VideoPlayerPage({ type }) {
  const { movieId, tvId, season, episode } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [audioLanguage, setAudioLanguage] = useState('pt-BR');
  const [subtitleLanguage, setSubtitleLanguage] = useState('pt-BR');
  const [seasonDetails, setSeasonDetails] = useState(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchContentDetails();
  }, [type, movieId, tvId, season, episode]);

  const fetchContentDetails = async () => {
    try {
      if (type === 'movie') {
        const response = await axios.get(`${API}/movies/${movieId}`);
        setContent(response.data);
      } else {
        const [tvResponse, seasonResponse, episodeResponse] = await Promise.all([
          axios.get(`${API}/tv/${tvId}`),
          axios.get(`${API}/tv/${tvId}/season/${season}`),
          axios.get(`${API}/tv/${tvId}/season/${season}/episode/${episode}`)
        ]);
        setContent({
          ...tvResponse.data,
          currentEpisode: episodeResponse.data,
          currentSeason: seasonResponse.data
        });
        setSeasonDetails(seasonResponse.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar conteúdo');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleNextEpisode = () => {
    if (type === 'tv' && seasonDetails && content.currentEpisode) {
      const currentEp = parseInt(episode);
      const nextEp = currentEp + 1;
      
      if (nextEp <= seasonDetails.episodes.length) {
        navigate(`/watch/tv/${tvId}/${season}/${nextEp}`);
      } else {
        toast.info('Último episódio da temporada');
      }
    }
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando player...</div>
      </div>
    );
  }

  if (!content) return null;

  const title = type === 'movie' ? content.title : `${content.name} - T${season}E${episode}`;
  const embedUrl = type === 'movie' 
    ? `https://embed.warezcdn.com/filme/${movieId}`
    : `https://embed.warezcdn.com/serie/${tvId}/${season}/${episode}`;

  return (
    <div 
      className="min-h-screen bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      <div className="relative w-full h-screen flex items-center justify-center" style={{ aspectRatio }}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          data-testid="video-player-iframe"
        />

        {/* Overlay Controls */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
              data-testid="back-button"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Voltar
            </Button>
            <h1 className="text-white text-xl font-semibold" data-testid="player-title">{title}</h1>
            <div className="w-20" />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            {/* Progress Bar */}
            <Slider
              value={[0]}
              max={100}
              step={1}
              className="w-full"
            />

            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 h-10 w-10"
                >
                  {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" fill="currentColor" />}
                </Button>

                {type === 'tv' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextEpisode}
                    className="text-white hover:bg-white/20 h-10 w-10"
                    data-testid="next-episode-button"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                )}

                <div className="flex items-center gap-2 group">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 h-10 w-10"
                  >
                    {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                  <div className="w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Slider
                      value={[muted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(val) => setVolume(val[0])}
                      className="w-full"
                    />
                  </div>
                </div>

                <span className="text-white text-sm">00:00 / 02:30:00</span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* Audio Language */}
                <Select value={audioLanguage} onValueChange={setAudioLanguage}>
                  <SelectTrigger className="w-[140px] bg-black/50 border-gray-700 text-white text-sm h-10">
                    <SelectValue placeholder="Áudio" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="pt-BR" className="text-white">🇧🇷 Português</SelectItem>
                    <SelectItem value="en" className="text-white">🇺🇸 English</SelectItem>
                    <SelectItem value="es" className="text-white">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>

                {/* Subtitles */}
                <Select value={subtitleLanguage} onValueChange={setSubtitleLanguage}>
                  <SelectTrigger className="w-[140px] bg-black/50 border-gray-700 text-white text-sm h-10">
                    <SelectValue placeholder="Legendas" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="off" className="text-white">Desligado</SelectItem>
                    <SelectItem value="pt-BR" className="text-white">🇧🇷 Português</SelectItem>
                    <SelectItem value="en" className="text-white">🇺🇸 English</SelectItem>
                    <SelectItem value="es" className="text-white">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>

                {/* Aspect Ratio */}
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="w-[120px] bg-black/50 border-gray-700 text-white text-sm h-10">
                    <Settings className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="16/9" className="text-white">16:9</SelectItem>
                    <SelectItem value="auto" className="text-white">Preencher</SelectItem>
                    <SelectItem value="4/3" className="text-white">4:3</SelectItem>
                    <SelectItem value="21/9" className="text-white">21:9</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.documentElement.requestFullscreen()}
                  className="text-white hover:bg-white/20 h-10 w-10"
                >
                  <Maximize className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Info for TV Shows */}
      {type === 'tv' && content.currentEpisode && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Temporada {season}, Episódio {episode}: {content.currentEpisode.name}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {content.currentEpisode.overview}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayerPage;