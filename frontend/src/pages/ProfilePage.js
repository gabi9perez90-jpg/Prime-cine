import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Crown, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfilePage({ user, updateUser }) {
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await axios.post(`${API}/auth/upgrade-premium`);
      const updatedUser = { ...user, plan: 'premium', premium_until: response.data.premium_until };
      updateUser(updatedUser);
      toast.success('🎉 Parabéns! Você agora é Premium!');
    } catch (error) {
      toast.error('Erro ao fazer upgrade. Tente novamente.');
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/browse')}
            className="text-white hover:bg-white/10"
            data-testid="back-to-browse-button"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para Início
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Profile Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white" data-testid="user-username">{user.username}</CardTitle>
                  <CardDescription className="text-gray-400" data-testid="user-email">{user.email}</CardDescription>
                </div>
                {user.plan === 'premium' ? (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-lg px-4 py-2" data-testid="premium-badge">
                    <Crown className="h-5 w-5 mr-2" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-700 text-gray-400 text-lg px-4 py-2" data-testid="free-badge">
                    <Star className="h-5 w-5 mr-2" />
                    Grátis
                  </Badge>
                )}
              </div>
            </CardHeader>
            {user.premium_until && (
              <CardContent>
                <p className="text-gray-400">
                  Premium ativo até: <span className="text-white font-semibold">{formatDate(user.premium_until)}</span>
                </p>
              </CardContent>
            )}
          </Card>

          <Separator className="bg-gray-800" />

          {/* Premium Upgrade Section */}
          {user.plan !== 'premium' ? (
            <Card className="bg-gradient-to-br from-purple-900 to-pink-900 border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-10">
                <Sparkles className="h-64 w-64" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-3xl text-white flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-300" />
                  Upgrade para Premium
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Desbloqueie todo o potencial da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">Acesso ilimitado a todo o catálogo</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">Qualidade HD e 4K</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">Sem anúncios</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">Downloads para assistir offline</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">Lançamentos exclusivos</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">R$ 19,90</span>
                      <span className="text-white/70">/mês</span>
                    </div>
                    <p className="text-white/70 mt-1">Cancele quando quiser</p>
                  </div>
                  
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg py-6"
                    data-testid="upgrade-premium-button"
                  >
                    {upgrading ? 'Processando...' : 'Fazer Upgrade Agora'}
                  </Button>
                  <p className="text-white/60 text-sm text-center mt-3">
                    * Simulação de upgrade - Nenhum pagamento será processado
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-purple-900 to-pink-900 border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-3">
                  <Crown className="h-7 w-7 text-yellow-300" />
                  Você é Premium!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg">
                  Aproveite todos os benefícios da sua assinatura Premium. Obrigado por nos apoiar!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Current Plan Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`border-2 ${user.plan === 'free' ? 'border-purple-500 bg-gray-900' : 'border-gray-800 bg-gray-900/50'}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Plano Grátis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-white mb-4">R$ 0</div>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>5 vídeos gratuitos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Qualidade SD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Com anúncios</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className={`border-2 ${user.plan === 'premium' ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/50' : 'border-gray-800 bg-gray-900/50'}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-300" />
                  Plano Premium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-white mb-4">R$ 19,90</div>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Acesso ilimitado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Qualidade HD/4K</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Sem anúncios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Downloads offline</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;