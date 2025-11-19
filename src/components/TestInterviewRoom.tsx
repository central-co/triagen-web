import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import InterviewRoom from './InterviewRoom';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import Button from './ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

/**
 * Test mode for LiveKit agent testing
 * Usage: http://localhost:3000/test-interview?token=JWT_TOKEN&room=ROOM_NAME
 *
 * This bypasses all candidate validation and connects directly to the room
 */
function TestInterviewRoom() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useDarkMode(true);

  const token = searchParams.get('token');
  const roomName = searchParams.get('room') || 'test-room';

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token JWT não fornecido na URL. Use: ?token=YOUR_JWT_TOKEN');
      return;
    }

    console.log('🧪 TEST MODE ACTIVATED');
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    console.log('🏠 Room:', roomName);

    setIsReady(true);
  }, [token, roomName]);

  // No token provided
  if (!token) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode} className="max-w-md">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center`}>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Modo de Teste - Token Necessário
              </h1>
            </div>

            <StatusMessage
              type="error"
              message={error}
              darkMode={darkMode}
            />

            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm mb-2 font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Como usar:
              </p>
              <code className={`text-xs block p-2 rounded ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-white text-green-600'}`}>
                /test-interview?token=YOUR_JWT_TOKEN&room=test-123
              </code>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
                icon={ArrowRight}
              >
                Voltar para Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Token provided, ready to connect
  if (isReady) {
    return (
      <>
        {/* Test mode banner */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🧪 MODO DE TESTE - Room: {roomName}
          </div>
        </div>

        <InterviewRoom
          jwtToken={token}
          candidateId="test-candidate" // Mock ID for test mode
          onLeave={() => {
            console.log('🧪 Test session ended');
            navigate('/');
          }}
        />
      </>
    );
  }

  // Loading state
  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card darkMode={darkMode}>
          <StatusMessage
            type="info"
            title="Preparando modo de teste..."
            message="Validando token JWT."
            darkMode={darkMode}
          />
        </Card>
      </div>
    </div>
  );
}

export default TestInterviewRoom;
