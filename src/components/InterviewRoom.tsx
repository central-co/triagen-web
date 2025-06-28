import { useState, useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  LocalAudioTrack,
  RemoteAudioTrack,
  TrackPublication
} from 'livekit-client';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import useAudioLevel from '../hooks/useAudioLevel';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import Card from './ui/card';
import StatusMessage from './ui/StatusMessage';

interface InterviewRoomProps {
  jwtToken: string;
  onLeave: () => void;
}

function InterviewRoom({ jwtToken, onLeave }: InterviewRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const { darkMode } = useDarkMode(true);
  const audioLevel = useAudioLevel(localAudioTrack);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    connectToRoom();
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  const connectToRoom = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError('');

    try {
      const roomInstance = new Room();
      
      // Event listeners
      roomInstance.on(RoomEvent.Connected, handleRoomConnected);
      roomInstance.on(RoomEvent.Disconnected, handleRoomDisconnected);
      roomInstance.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      roomInstance.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      roomInstance.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      roomInstance.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      roomInstance.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);

      // Connect to room
      await roomInstance.connect('wss://your-livekit-server.com', jwtToken, {
        autoSubscribe: true,
      });
      
      // Enable audio
      await roomInstance.localParticipant.enableCameraAndMicrophone();
      
      // Get local audio track
      const audioTrackPubs = Array.from(roomInstance.localParticipant.audioTrackPublications.values());
      if (audioTrackPubs.length > 0 && audioTrackPubs[0].track) {
        setLocalAudioTrack(audioTrackPubs[0].track as LocalAudioTrack);
      }

      setRoom(roomInstance);
    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError(err instanceof Error ? err.message : 'Falha ao conectar na sala');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRoomConnected = () => {
    console.log('Connected to room');
    setIsConnected(true);
  };

  const handleRoomDisconnected = () => {
    console.log('Disconnected from room');
    setIsConnected(false);
    setLocalAudioTrack(null);
    setParticipants([]);
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    console.log('Participant connected:', participant.identity);
    setParticipants(prev => [...prev, participant]);
    
    // Subscribe to audio tracks
    const audioTrackPubs = Array.from(participant.audioTrackPublications.values());
    audioTrackPubs.forEach((pub: TrackPublication) => {
      if (pub.track) {
        handleTrackSubscribed(pub.track);
      }
    });
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    console.log('Participant disconnected:', participant.identity);
    setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
  };

  const handleTrackSubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Audio) {
      const audioTrack = track as RemoteAudioTrack;
      
      if (audioRef.current) {
        audioTrack.attach(audioRef.current);
      }
    }
  };

  const handleTrackUnsubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Audio) {
      if (audioRef.current) {
        track.detach(audioRef.current);
      }
    }
  };

  const handleLocalTrackPublished = (publication: TrackPublication) => {
    if (publication.kind === Track.Kind.Audio && publication.track) {
      setLocalAudioTrack(publication.track as LocalAudioTrack);
    }
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.mute();
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isSpeakerMuted;
    }
  };

  const handleLeave = () => {
    if (room) {
      room.disconnect();
    }
    onLeave();
  };

  if (!isConnected && !isConnecting) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <AnimatedBackground darkMode={darkMode} isRoom />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="error"
              title="Conexão perdida"
              message="A conexão com a sala foi perdida. Tente novamente."
              darkMode={darkMode}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={connectToRoom}
              className="mt-4 bg-gradient-to-r from-triagen-dark-bg to-triagen-primary-accent"
            >
              Reconectar
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <AnimatedBackground darkMode={darkMode} isRoom />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="info"
              title="Conectando..."
              message="Estabelecendo conexão com a sala de entrevista."
              darkMode={darkMode}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <AnimatedBackground darkMode={darkMode} isRoom />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card darkMode={darkMode} className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
              Entrevista em Andamento
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Participantes conectados: {participants.length + 1}
            </p>
          </div>

          {/* Audio level indicator */}
          <div className="mb-8">
            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
              <div
                className="h-full bg-gradient-to-r from-triagen-secondary-accent to-triagen-primary-accent rounded-full transition-all duration-100"
                style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
              />
            </div>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`}>
              Nível do microfone
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={isMuted ? "outline" : "secondary"}
              size="lg"
              onClick={toggleMute}
              icon={isMuted ? MicOff : Mic}
              darkMode={darkMode}
            >
              {isMuted ? 'Desmutar' : 'Mutar'}
            </Button>

            <Button
              variant={isSpeakerMuted ? "outline" : "secondary"}
              size="lg"
              onClick={toggleSpeaker}
              icon={isSpeakerMuted ? VolumeX : Volume2}
              darkMode={darkMode}
            >
              {isSpeakerMuted ? 'Ativar Som' : 'Mutar Som'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleLeave}
              icon={PhoneOff}
              darkMode={darkMode}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Sair
            </Button>
          </div>

          {error && (
            <StatusMessage
              type="error"
              message={error}
              darkMode={darkMode}
            />
          )}
        </Card>
      </div>

      {/* Hidden audio element for remote audio */}
      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}

export default InterviewRoom;