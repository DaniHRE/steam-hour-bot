import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useClients } from '../hooks/useClients';

interface BotControlFormProps {
  clientId: string;
  onSuccess?: () => void;
}

export const BotControlForm = ({ clientId, onSuccess }: BotControlFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [gamesId, setGamesId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { startBot, stopBot } = useClients();

  const handleStartBot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpa mensagens anteriores
    setError(null);
    setSuccess(null);
    
    if (!username || !password || !otp || !gamesId) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsStarting(true);
      
      // Parse games ID - espera uma string como "730,440,570"
      const gameIds = gamesId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (gameIds.length === 0) {
        setError('IDs de jogos inválidos. Use o formato: 730,440,570');
        return;
      }

      if (gameIds.length > 30) {
        setError('Máximo de 30 jogos permitidos');
        return;
      }

      await startBot(clientId, username, password, otp, gameIds);
      
      // Sucesso - limpa o formulário e mostra mensagem
      setError(null);
      setSuccess('✅ Bot iniciado com sucesso! Começando a farmar horas...');
      setUsername('');
      setPassword('');
      setOtp('');
      setGamesId('');
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
      
      onSuccess?.();
    } catch (error) {
      // Trata diferentes tipos de erro
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Erros específicos de validação de jogos - tratamento especial
        if (errorMessage.includes("don't own")) {
          const gamesPart = errorMessage.split("You don't own the following games: ")[1];
          if (gamesPart) {
            const gamesOnly = gamesPart.split(". You can only farm hours")[0];
            setError(`🚫 Você não possui os seguintes jogos na sua conta Steam:\n\n${gamesOnly}\n\n⚠️ Só é possível farmar horas de jogos que você realmente possui!`);
          } else {
            setError(`🚫 ${errorMessage}`);
          }
        }
        // Erros de autenticação Steam
        else if (errorMessage.includes('Invalid password')) {
          setError('🔐 Senha incorreta. Verifique suas credenciais Steam.');
        }
        else if (errorMessage.includes('Steam Guard')) {
          setError('🔑 Código Steam Guard inválido ou expirado. Tente novamente.');
        }
        else if (errorMessage.includes('Already logged in')) {
          setError('🔄 Esta conta já está logada em outro lugar. Deslogue primeiro.');
        }
        else if (errorMessage.includes('Bot is already running')) {
          setError('⚙️ O bot já está rodando para este cliente.');
        }
        // Outros erros
        else {
          setError(`❌ Erro: ${errorMessage}`);
        }
      } else {
        setError('❌ Erro desconhecido ao iniciar bot');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopBot = async () => {
    try {
      setError(null);
      setSuccess(null);
      await stopBot(clientId);
      setSuccess('✅ Bot parado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
      onSuccess?.();
    } catch (error) {
      setError(`❌ Erro ao parar bot: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Controle do Bot</CardTitle>
        <CardDescription>
          Configure e inicie o bot Steam para o cliente {clientId.slice(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 whitespace-pre-line font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleStartBot} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Usuário Steam
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário Steam"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha Steam"
              required
            />
          </div>
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              Código OTP (Steam Guard)
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Código de 5 dígitos"
              maxLength={5}
              required
            />
          </div>
          
          <div>
            <label htmlFor="gamesId" className="block text-sm font-medium mb-1">
              IDs dos Jogos
            </label>
            <Input
              id="gamesId"
              type="text"
              value={gamesId}
              onChange={(e) => setGamesId(e.target.value)}
              placeholder="730,440,570 (separados por vírgula)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo 30 jogos. Ex: 730 (CS2), 440 (TF2), 570 (Dota 2)
            </p>
            <p className="text-xs text-amber-600 mt-1 font-medium">
              ⚠️ Você só pode farmar jogos que possui na sua biblioteca Steam!
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isStarting}
              className="flex-1"
            >
              {isStarting ? 'Iniciando...' : 'Iniciar Bot'}
            </Button>
            
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleStopBot}
              className="flex-1"
            >
              Parar Bot
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
