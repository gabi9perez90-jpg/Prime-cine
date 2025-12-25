import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Search, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import ImageWithLoader from '@/components/ImageWithLoader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [sections, setSections] = useState({
    trending: [],
    releases: [],
    topRated: [],
    action: [],
    horror: [],
    comedy: [],
    anime: [],
    cartoons: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      performSearch(debouncedSearch);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch]);

  const fetchAllContent = async () => {
    try {
      const [trending, releases, topRated, action, horror, comedy, anime, cartoons] = await Promise.all([
        axios.get(`${API}/trending/all/week`),
        axios.get(`${API}/latest/movies`),
        axios.get(`${API}/top-rated/movies`),
        axios.get(`${API}/genre/28`), // Action
        axios.get(`${API}/genre/27`), // Horror
        axios.get(`${API}/genre/35`), // Comedy
        axios.get(`${API}/anime`),
        axios.get(`${API}/cartoons`)
      ]);
      
      setSections({
        trending: trending.data.results || [],
        releases: releases.data.results || [],
        topRated: topRated.data.results || [],
        action: action.data.results || [],
        horror: horror.data.results || [],
        comedy: comedy.data.results || [],
        anime: anime.data.results || [],
        cartoons: cartoons.data.results || []
      });
    } catch (error) {
      toast.error('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      const response = await axios.get(`${API}/search/multi`, { params: { query } });
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.media_type === 'tv' || item.first_air_date) {
      navigate(`/tv/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  const ContentCard = ({ item, small }) => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;

    return (
      <Card 
        className="bg-gray-900 border-gray-800 overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 flex-shrink-0"
        style={{ width: small ? '140px' : '180px' }}
        onClick={() => handleItemClick(item)}
        data-testid={`content-card-${item.id}`}
        data-focusable="true"
      >
        <div className="relative">
          <ImageWithLoader
            src={item.poster_path}
            alt={title}
            size="w500"
            aspectRatio="2/3"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {item.vote_average > 0 && (
            <Badge className="absolute top-2 right-2 bg-yellow-600 border-0 flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" fill="currentColor" />
              {item.vote_average.toFixed(1)}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
          <p className="text-gray-400 text-xs">{date ? new Date(date).getFullYear() : 'N/A'}</p>
        </CardContent>
      </Card>
    );
  };

  const ContentRow = ({ title, items, icon: Icon }) => {
    const scrollRef = useState(null);
    
    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'left' ? -600 : 600;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-purple-500" />}
            {title}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.slice(0, 20).map(item => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-b from-black to-transparent fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Tv className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-white" data-testid="app-title">PrimeCine</span>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder="Buscar filmes, séries, animes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="pl-10 bg-gray-900/80 border-gray-700 text-white placeholder:text-gray-500 backdrop-blur-sm"
                data-testid="search-input"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg max-h-96 overflow-y-auto shadow-2xl z-20">
                  {searchResults.slice(0, 10).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
                      onClick={() => {
                        handleItemClick(item);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="w-12 flex-shrink-0">
                        <ImageWithLoader
                          src={item.poster_path}
                          alt={item.title || item.name}
                          size="w92"
                          aspectRatio="2/3"
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">{item.title || item.name}</h4>
                        <p className="text-gray-400 text-xs">
                          {item.media_type === 'movie' ? 'Filme' : 'Série'} • {(item.release_date || item.first_air_date)?.slice(0, 4)}
                        </p>
                      </div>
                      {item.vote_average > 0 && (
                        <Badge className="bg-yellow-600 border-0 text-xs flex-shrink-0">
                          <Star className="h-3 w-3 mr-1" fill="currentColor" />
                          {item.vote_average.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  ))}
                  <div className="p-3 border-t border-gray-800 bg-gray-800/50">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-purple-400 hover:text-purple-300 text-sm font-semibold w-full text-center"
                    >
                      Ver todos os resultados →
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      {sections.trending.length > 0 && (
        <div className="relative h-[70vh] md:h-[80vh]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${IMAGE_BASE}/original${sections.trending[0].backdrop_path})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 py-20 pt-32">
              <div className="max-w-2xl space-y-4">
                <Badge className="bg-purple-600 border-0 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Em Alta
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  {sections.trending[0].title || sections.trending[0].name}
                </h1>
                <p className="text-lg text-gray-300 line-clamp-3">
                  {sections.trending[0].overview}
                </p>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleItemClick(sections.trending[0])}
                    className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
                    data-testid="hero-watch-button"
                  >
                    Assistir Agora
                  </Button>
                  {sections.trending[0].vote_average > 0 && (
                    <div className="flex items-center gap-2 text-white">
                      <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
                      <span className="text-xl font-semibold">{sections.trending[0].vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="py-12 space-y-2">
        {loading ? (
          <div className="text-white text-center py-20">Carregando...</div>
        ) : (
          <>
            <ContentRow title="Lançamentos" items={sections.releases} />
            <ContentRow title="Mais Vistos" items={sections.topRated} />
            <ContentRow title="Ação" items={sections.action} />
            <ContentRow title="Terror" items={sections.horror} />
            <ContentRow title="Comédia" items={sections.comedy} />
            <ContentRow title="Animes" items={sections.anime} />
            <ContentRow title="Desenhos Animados" items={sections.cartoons} />
          </>
        )}
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default HomePage;