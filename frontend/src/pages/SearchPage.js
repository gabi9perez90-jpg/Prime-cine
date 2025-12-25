import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleItemClick = (item) => {
    if (item.media_type === 'tv') {
      navigate(`/tv/${item.id}`);
    } else if (item.media_type === 'movie') {
      navigate(`/movie/${item.id}`);
    }
  };

  const movies = results.filter(r => r.media_type === 'movie');
  const tvShows = results.filter(r => r.media_type === 'tv');

  const ContentCard = ({ item }) => {
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;
    const posterPath = item.poster_path ? `${IMAGE_BASE}/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

    return (
      <Card 
        className="bg-gray-900 border-gray-800 overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => handleItemClick(item)}
        data-testid={`search-result-${item.id}`}
      >
        <div className="relative aspect-[2/3]">
          <img 
            src={posterPath}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex gap-2">
            {item.vote_average > 0 && (
              <Badge className="bg-yellow-600 border-0 flex items-center gap-1">
                <Star className="h-3 w-3" fill="currentColor" />
                {item.vote_average.toFixed(1)}
              </Badge>
            )}
          </div>
          <div className="absolute top-2 left-2">
            <Badge className="bg-purple-600 border-0 text-xs">
              {item.media_type === 'movie' ? 'Filme' : 'Série'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">{title}</h3>
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
                  placeholder="Buscar filmes e séries..."
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
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Resultados para "{searchQuery}" ({results.length})
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map(item => (
                    <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="movies">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map(item => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tv">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {tvShows.map(item => (
                    <ContentCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;