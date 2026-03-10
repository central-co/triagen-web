import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/Button';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import PageHeader from './ui/PageHeader';

type Step = 'mic' | 'audio';

interface PreInterviewRoomProps {
  onConfirm: () => void;
  onBack: () => void;
}

function PreInterviewRoom({ onConfirm, onBack }: PreInterviewRoomProps) {
  const { darkMode } = useDarkMode(true);
  const [step, setStep] = useState<Step>('mic');

  // --- Mic step state ---
  const [micLevel, setMicLevel] = useState(0);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [micPassed, setMicPassed] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const envelopeRef = useRef(0); // manual envelope follower (not state)

  // --- Audio step state ---
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Start mic check on mount
  useEffect(() => {
    let rafId = 0;
    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(async stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        setMicPermission(true);

        const ctx = new AudioContext();
        micCtxRef.current = ctx;
        await ctx.resume(); // ensure not suspended

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.1; // fast response
        const data = new Uint8Array(analyser.fftSize);
        ctx.createMediaStreamSource(stream).connect(analyser);

        let sustainedFrames = 0;

        const tick = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);

          // Asymmetric envelope follower: fast attack, fast release
          // smoothingTimeConstant only works for frequency domain — so we do this manually
          const gated = rms < 0.01 ? 0 : rms; // noise gate: silence below threshold
          const alpha = gated > envelopeRef.current ? 0.4 : 0.2;
          envelopeRef.current = alpha * envelopeRef.current + (1 - alpha) * gated;
          const level = Math.min(envelopeRef.current * 400, 100);
          setMicLevel(level);

          if (rms > 0.08) {
            sustainedFrames++;
            if (sustainedFrames >= 15) setMicPassed(true);
          } else {
            sustainedFrames = 0;
          }

          rafId = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => setMicPermission(false));

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      streamRef.current?.getTracks().forEach(t => t.stop());
      micCtxRef.current?.close();
    };
  }, []);

  // Clean up audio context on unmount
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const handleGoToAudioStep = () => {
    setStep('audio');
  };

  const playTestSound = async () => {
    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;
    await ctx.resume(); // ensure not suspended — must be called inside user gesture

    setIsPlayingTest(true);

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.5);
    oscillator.onended = () => setIsPlayingTest(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
      <AnimatedBackground darkMode={darkMode} />
      <PageHeader darkMode={darkMode} />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {(['mic', 'audio'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step === s
                    ? 'bg-triagen-primary-blue text-white'
                    : s === 'mic' && step === 'audio'
                      ? 'bg-green-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s === 'mic' && step === 'audio' ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < 1 && (
                  <div className={`w-12 h-0.5 ${step === 'audio' ? 'bg-green-500' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <Card darkMode={darkMode}>
            {step === 'mic' && (
              <>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-colors ${
                    micPermission === false ? 'bg-red-500/20' :
                    micPassed ? 'bg-green-500/20' : 'bg-triagen-primary-blue/20'
                  }`}>
                    {micPermission === false
                      ? <MicOff className="h-10 w-10 text-red-500" />
                      : micPassed
                        ? <CheckCircle2 className="h-10 w-10 text-green-500" />
                        : <Mic className="h-10 w-10 text-triagen-primary-blue" />
                    }
                  </div>
                  <h1 className={`font-heading text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Teste de Microfone
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    {micPassed ? 'Microfone funcionando! ✅' : 'Fale algo para verificar seu microfone'}
                  </p>
                </div>

                {micPermission === false ? (
                  <StatusMessage
                    type="error"
                    title="Acesso negado"
                    message="Permita o acesso ao microfone nas configurações do browser e recarregue a página."
                    darkMode={darkMode}
                  />
                ) : (
                  <div className="mb-8">
                    <div className={`h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
                      <div
                        className={`h-full rounded-full ${micPassed ? 'bg-green-500' : 'bg-gradient-to-r from-triagen-secondary-green to-triagen-primary-blue'}`}
                        style={{ width: `${micLevel}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                      {micPassed ? 'Sinal detectado com sucesso' : 'Aguardando sinal de áudio...'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" fullWidth onClick={onBack} darkMode={darkMode}>
                    Voltar
                  </Button>
                  <Button
                    variant="primary-solid"
                    size="lg"
                    fullWidth
                    onClick={handleGoToAudioStep}
                    disabled={!micPassed}
                    icon={ArrowRight}
                  >
                    Próximo
                  </Button>
                </div>
              </>
            )}

            {step === 'audio' && (
              <>
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-triagen-primary-blue/20`}>
                    <Volume2 className="h-10 w-10 text-triagen-primary-blue" />
                  </div>
                  <h1 className={`font-heading text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                    Teste de Áudio
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
                    Clique para reproduzir um som e confirme se consegue ouvir
                  </p>
                </div>

                <div className="mb-8 flex justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={playTestSound}
                    disabled={isPlayingTest}
                    icon={Volume2}
                    darkMode={darkMode}
                  >
                    {isPlayingTest ? 'Reproduzindo...' : 'Tocar som de teste'}
                  </Button>
                </div>

                <p className={`text-sm text-center mb-6 font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-dark-bg'}`}>
                  Você conseguiu ouvir o som?
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => setStep('mic')}
                    icon={XCircle}
                    darkMode={darkMode}
                  >
                    Não ouvi
                  </Button>
                  <Button
                    variant="primary-solid"
                    size="lg"
                    fullWidth
                    onClick={onConfirm}
                    icon={CheckCircle2}
                  >
                    Sim, ouvi!
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PreInterviewRoom;
