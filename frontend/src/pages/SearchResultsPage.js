import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Star, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageWithLoader from '@/components/ImageWithLoader';
import { useDebounce } from '@/hooks/use-debounce';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    // Detect device type
    const screenWidth = window.innerWidth;
    setIsTV(screenWidth >= 768);
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      performSearch(debouncedSearch);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/search/multi`, {
        params: { query }
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.media_type === 'tv' || item.first_air_date) {
      navigate(`/tv/${item.id}`);
    } else {
      navigate(`/movie/${item.id}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const movies = results.filter(r => r.media_type === 'movie');
  const tvShows = results.filter(r => r.media_type === 'tv');

  // Mobile Layout Component
  const MobileCard = ({ item }) => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;

    return (
      <Card 
        className="bg-gray-900 border-gray-800 overflow-hidden cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => handleItemClick(item)}
        data-testid={`search-result-${item.id}`}
      >
        <div className="flex gap-3 p-3">
          <div className="w-24 flex-shrink-0">
            <ImageWithLoader
              src={item.poster_path}
              alt={title}
              size="w200"
              aspectRatio="2/3"
              className="rounded"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-1 line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-600 border-0 text-xs">
                {item.media_type === 'movie' ? 'Filme' : 'Série'}
              </Badge>
              {item.vote_average > 0 && (
                <Badge className="bg-yellow-600 border-0 text-xs flex items-center gap-1">
                  <Star className="h-3 w-3" fill="currentColor" />
                  {item.vote_average.toFixed(1)}
                </Badge>
              )}
            </div>
            <p className="text-gray-400 text-xs mb-2">
              {date ? new Date(date).getFullYear() : 'N/A'}
            </p>
            {item.overview && (
              <p className="text-gray-500 text-xs line-clamp-2">{item.overview}</p>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // TV Layout Component
  const TVCard = ({ item }) => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;

    return (
      <Card 
        className="bg-gray-900 border-gray-800 overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => handleItemClick(item)}
        data-testid={`search-result-${item.id}`}
        data-focusable="true"
      >
        <ImageWithLoader
          src={item.poster_path}
          alt={title}
          size="w500"
          aspectRatio="2/3"
        />
        <CardContent className="p-3">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2 mb-1">
            {item.vote_average > 0 && (
              <Badge className="bg-yellow-600 border-0 text-xs flex items-center gap-1">
                <Star className="h-3 w-3" fill="currentColor" />
                {item.vote_average.toFixed(1)}
              </Badge>
            )}
            <Badge className="bg-purple-600 border-0 text-xs">
              {item.media_type === 'movie' ? 'Filme' : 'Série'}
            </Badge>
          </div>
          <p className="text-gray-400 text-xs">{date ? new Date(date).getFullYear() : 'N/A'}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar filmes, séries, animes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  autoFocus
                  data-testid="search-input"
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-white text-center py-20">Buscando...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">
              {searchQuery ? 'Nenhum resultado encontrado' : 'Digite algo para buscar'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{searchQuery}"
              </h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-gray-900 border border-gray-800 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                  Todos ({results.length})
                </TabsTrigger>
                <TabsTrigger value="movies" className="data-[state=active]:bg-purple-600">
                  Filmes ({movies.length})
                </TabsTrigger>
                <TabsTrigger value="tv" className="data-[state=active]:bg-purple-600">
                  Séries ({tvShows.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isTV ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results.map(item => (
                      <TVCard key={`${item.media_type}-${item.id}`} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map(item => (
                      <MobileCard key={`${item.media_type}-${item.id}`} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="movies">
                {isTV ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {movies.map(item => (
                      <TVCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {movies.map(item => (
                      <MobileCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tv">
                {isTV ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tvShows.map(item => (
                      <TVCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tvShows.map(item => (
                      <MobileCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;