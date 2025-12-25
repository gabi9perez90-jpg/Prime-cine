import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, LogOut, User, Crown, Play, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function BrowsePage({ user, logout }) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCategory, searchQuery]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API}/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  };

  const handleVideoClick = (videoId, isPremium) => {
    if (isPremium && user.plan !== 'premium') {
      navigate('/profile');
    } else {
      navigate(`/watch/${videoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/browse')}>
                <Tv className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold text-white">PrimeCine</span>
              </div>
              <div className="hidden md:flex gap-6">
                <button className="text-white hover:text-purple-400 transition">Início</button>
                <button className="text-gray-400 hover:text-white transition">Filmes</button>
                <button className="text-gray-400 hover:text-white transition">Séries</button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user.plan === 'premium' && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
                className="text-white hover:text-purple-400"
                data-testid="profile-button"
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-white hover:text-red-400"
                data-testid="logout-button"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar filmes e séries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                data-testid="search-input"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-white text-center py-20">Carregando...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-gray-400 text-center py-20">
            <p className="text-xl">Nenhum vídeo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <Card 
                key={video.id} 
                className="bg-gray-900 border-gray-800 overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => handleVideoClick(video.id, video.is_premium)}
                data-testid={`video-card-${video.id}`}
              >
                <div className="relative aspect-video">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {video.is_premium && user.plan !== 'premium' ? (
                      <Lock className="h-12 w-12 text-yellow-500" />
                    ) : (
                      <Play className="h-12 w-12 text-white" />
                    )}
                  </div>
                  {video.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-1 truncate">{video.title}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.category}</span>
                    <span>{video.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Premium CTA */}
        {user.plan !== 'premium' && (
          <Card className="mt-12 bg-gradient-to-r from-purple-900 to-pink-900 border-0">
            <CardContent className="p-8 text-center">
              <Crown className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Desbloqueie Todo o Conteúdo</h2>
              <p className="text-white/90 mb-6">Upgrade para Premium e tenha acesso ilimitado</p>
              <Button 
                onClick={() => navigate('/profile')}
                className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8"
                data-testid="upgrade-cta-button"
              >
                Fazer Upgrade Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;