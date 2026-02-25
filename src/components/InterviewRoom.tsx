import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  LocalAudioTrack,
  RemoteAudioTrack,
  TrackPublication
} from 'livekit-client';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Users, Bot, User } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import useAudioLevel from '../hooks/useAudioLevel';
import { useAppConfig } from '../hooks/useAppConfig';
import AnimatedBackground from './ui/AnimatedBackground';
import Button from './ui/button';
import Card from './ui/Card';
import StatusMessage from './ui/StatusMessage';
import RemoteAudioTrackComponent from './RemoteAudioTrack';
import { finishInterviewSession } from '../api/interview';

interface InterviewRoomProps {
  jwtToken: string;
  candidateId: string;
  onLeave: () => void;
}

interface ParticipantInfo {
  identity: string;
  type: 'local' | 'agent' | 'remote';
  isLocal: boolean;
}

function InterviewRoom({ jwtToken, candidateId, onLeave }: InterviewRoomProps) {
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<RemoteAudioTrack[]>([]);
  const [localParticipantIdentity, setLocalParticipantIdentity] = useState<string>('');
  const { darkMode } = useDarkMode(true);
  const audioLevel = useAudioLevel(localAudioTrack);
  const roomRef = useRef<Room | null>(null);
  const { config, loading: configLoading, error: configError } = useAppConfig();

  useEffect(() => {
    if (config && !configLoading) {
      connectToRoom();
    }
    return () => {
      if (room) {
        room.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, configLoading]);

  // Helper function to determine participant type
  const getParticipantType = (identity: string): 'agent' | 'remote' => {
    // Check if identity contains 'agent' or 'bot' (case-insensitive)
    const lowerIdentity = identity.toLowerCase();
    if (lowerIdentity.includes('agent') || lowerIdentity.includes('bot')) {
      return 'agent';
    }
    return 'remote';
  };

  // Get all participants with their types
  const getAllParticipants = (): ParticipantInfo[] => {
    const allParticipants: ParticipantInfo[] = [];

    // Add local participant
    if (localParticipantIdentity) {
      allParticipants.push({
        identity: localParticipantIdentity,
        type: 'local',
        isLocal: true
      });
    }

    // Add remote participants
    participants.forEach(participant => {
      allParticipants.push({
        identity: participant.identity,
        type: getParticipantType(participant.identity),
        isLocal: false
      });
    });

    return allParticipants;
  };

  const connectToRoom = async () => {
    if (isConnecting || !config) return;

    setIsConnecting(true);
    setError('');

    try {
      const livekitUrl = config.livekitUrl;

      if (!livekitUrl) {
        throw new Error('LiveKit server URL not configured. Please check your configuration.');
      }

      // Validate that the URL is a WebSocket URL
      if (!livekitUrl.startsWith('ws://') && !livekitUrl.startsWith('wss://')) {
        throw new Error('LiveKit URL must be a WebSocket URL (starting with ws:// or wss://)');
      }

      const roomInstance = new Room();

      // Store in ref BEFORE setting up event listeners so handlers can access it
      roomRef.current = roomInstance;

      // Event listeners
      roomInstance.on(RoomEvent.Connected, handleRoomConnected);
      roomInstance.on(RoomEvent.Disconnected, handleRoomDisconnected);
      roomInstance.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      roomInstance.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      roomInstance.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      roomInstance.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      roomInstance.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);

      // Connect to room using config
      await roomInstance.connect(livekitUrl, jwtToken, {
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

      console.log('✅ Connected to room - Local:', roomInstance.localParticipant.identity, '| Remote:', roomInstance.remoteParticipants.size);
    } catch (err) {
      console.error('Failed to connect to room:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao conectar na sala de entrevista');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRoomConnected = () => {
    setIsConnected(true);

    // Store local participant identity using roomRef
    if (roomRef.current?.localParticipant) {
      const identity = roomRef.current.localParticipant.identity;
      setLocalParticipantIdentity(identity);

      // Also capture any remote participants already in the room
      const remoteParticipants = Array.from(roomRef.current.remoteParticipants.values());
      if (remoteParticipants.length > 0) {
        setParticipants(remoteParticipants);

        // Capture existing tracks
        remoteParticipants.forEach(p => {
          p.audioTrackPublications.forEach(pub => {
            if (pub.track && pub.track.kind === Track.Kind.Audio) {
              handleTrackSubscribed(pub.track);
            }
          });
        });
      }

      console.log('✅ Room ready - You:', identity, '| Others:', remoteParticipants.length);
    }
  };

  const handleRoomDisconnected = () => {
    setIsConnected(false);
    setLocalAudioTrack(null);
    setParticipants([]);
    setLocalParticipantIdentity('');
    roomRef.current = null;

    // Redirect to finished page
    navigate(`/interview/${candidateId}/finished`);
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    console.log('➕ Participant joined:', participant.identity);
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
    console.log('➖ Participant left:', participant.identity);
    setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
  };

  const handleTrackSubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Audio) {
      const audioTrack = track as RemoteAudioTrack;
      setRemoteAudioTracks(prev => {
        if (prev.some(t => t.sid === audioTrack.sid)) return prev;
        return [...prev, audioTrack];
      });
    }
  };

  const handleTrackUnsubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Audio) {
      const audioTrack = track as RemoteAudioTrack;
      setRemoteAudioTracks(prev => prev.filter(t => t.sid !== audioTrack.sid));
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
  };

  const handleLeave = async () => {
    try {
      // Call backend to finish session before disconnecting
      if (candidateId) {
        await finishInterviewSession(candidateId).catch(err => {
          console.error('Failed to finish session:', err);
          // Continue with disconnect even if API call fails
        });
      }
    } finally {
      // Always disconnect and navigate to finished page
      if (room) {
        room.disconnect();
      }
      // Navigate to finished page instead of calling onLeave
      navigate(`/interview/${candidateId}/finished`);
    }
  };

  // Show loading while config is loading
  if (configLoading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} isRoom />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="info"
              title="Carregando configuração..."
              message="Obtendo configurações do servidor."
              darkMode={darkMode}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Show error if config failed to load
  if (configError) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} isRoom />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="error"
              title="Erro de configuração"
              message={configError}
              darkMode={darkMode}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!isConnected && !isConnecting) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
        <AnimatedBackground darkMode={darkMode} isRoom />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card darkMode={darkMode}>
            <StatusMessage
              type="error"
              title="Conexão perdida"
              message={error || "A conexão com a sala foi perdida. Tente novamente."}
              darkMode={darkMode}
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={connectToRoom}
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
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
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
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-triagen-light-bg'}`}>
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

          {/* Participants List */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Users className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'}`} />
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-triagen-dark-bg'}`}>
                Participantes na Sala
              </h2>
            </div>
            <div className="space-y-2">
              {getAllParticipants().map((participant, index) => {
                const isAgent = participant.type === 'agent';
                const isLocal = participant.type === 'local';
                const Icon = isAgent ? Bot : User;

                return (
                  <div
                    key={`${participant.identity}-${index}`}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-triagen-border-light'
                      }`}
                  >
                    <div className={`p-2 rounded-full ${isLocal
                        ? 'bg-triagen-primary-blue/20'
                        : isAgent
                          ? 'bg-triagen-secondary-green/20'
                          : 'bg-gray-500/20'
                      }`}>
                      <Icon className={`h-5 w-5 ${isLocal
                          ? 'text-triagen-primary-blue'
                          : isAgent
                            ? 'text-triagen-secondary-green'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-triagen-dark-bg'
                        }`}>
                        {participant.identity}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-triagen-text-light'
                        }`}>
                        {isLocal ? 'Você' : isAgent ? 'Agente IA' : 'Participante Remoto'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio level indicator */}
          <div className="mb-8">
            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-triagen-border-light'}`}>
              <div
                className="h-full bg-gradient-to-r from-triagen-secondary-green to-triagen-primary-blue rounded-full transition-all duration-100"
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

      {/* Remote Audio Tracks */}
      {remoteAudioTracks.map(track => (
        <RemoteAudioTrackComponent
          key={track.sid}
          track={track}
          volume={isSpeakerMuted ? 0 : 1.0}
        />
      ))}
    </div>
  );
}

export default InterviewRoom;