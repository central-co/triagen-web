import { useState, useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  LocalAudioTrack,
  RemoteAudioTrack
} from 'livekit-client';
import { Mic, MicOff, PhoneOff, Pause, Settings, Play } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';
import useAudioLevel from '../hooks/useAudioLevel';
import { config } from '../utils/config';
import StatusMessage from './ui/StatusMessage';
import RemoteAudioTrackComponent from './RemoteAudioTrack';

interface InterviewRoomProps {
  jwtToken: string;
  onFinished: () => void;
}

function InterviewRoom({ jwtToken, onFinished }: InterviewRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<RemoteAudioTrack[]>([]);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { darkMode } = useDarkMode(true);
  const audioLevel = useAudioLevel(localAudioTrack);
  const roomRef = useRef<Room | null>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected, isPaused]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    connectToRoom();
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const connectToRoom = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setError('');

    try {
      const livekitUrl = config.livekitUrl;
      const roomInstance = new Room();
      roomRef.current = roomInstance;

      roomInstance.on(RoomEvent.Connected, handleRoomConnected);
      roomInstance.on(RoomEvent.Disconnected, handleRoomDisconnected);
      roomInstance.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      roomInstance.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      roomInstance.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      roomInstance.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      await roomInstance.connect(livekitUrl, jwtToken, { autoSubscribe: true });
      await roomInstance.localParticipant.setMicrophoneEnabled(true);

      const audioTrackPubs = Array.from(roomInstance.localParticipant.audioTrackPublications.values());
      if (audioTrackPubs.length > 0 && audioTrackPubs[0].track) {
        setLocalAudioTrack(audioTrackPubs[0].track as LocalAudioTrack);
      }

      setRoom(roomInstance);
    } catch (err) {
      setError('Falha ao conectar na sala de entrevista');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRoomConnected = () => {
    setIsConnected(true);
    if (roomRef.current?.remoteParticipants) {
      const remoteParticipants = Array.from(roomRef.current.remoteParticipants.values());
      setParticipants(remoteParticipants);
    }
  };

  const handleRoomDisconnected = () => {
    setIsConnected(false);
    setLocalAudioTrack(null);
    setParticipants([]);
    roomRef.current = null;
    onFinished();
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    setParticipants(prev => [...prev, participant]);
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
  };

  const handleTrackSubscribed = (track: Track, publication: any, participant: RemoteParticipant) => {
    if (track.kind === Track.Kind.Audio) {
      setRemoteAudioTracks(prev => [...prev, track as RemoteAudioTrack]);
    }
  };

  const handleTrackUnsubscribed = (track: Track) => {
    if (track.kind === Track.Kind.Audio) {
      setRemoteAudioTracks(prev => prev.filter(t => t.sid !== track.sid));
    }
  };

  const toggleMute = () => {
    if (room?.localParticipant) {
      const newMutedState = !isMuted;
      room.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    // Real implementation would pause the LLM agent stream specifically
  };

  const disconnect = () => {
    room?.disconnect();
  };

  // Audio visualization bars (fake visualization based on overall audiolevel)
  const renderAudioBars = () => {
    const bars = 9;
    return (
      <div className="flex items-center justify-center gap-1.5 md:gap-2.5 h-32 mb-12">
        {Array.from({ length: bars }).map((_, i) => {
          // Center is biggest, edges are smaller
          const distanceFromCenter = Math.abs(i - Math.floor(bars / 2));
          const baseHeight = 100 - (distanceFromCenter * 20); // 100%, 80%, 60%, 40%, 20%
          
          // Add some randomness based on audio level if active
          const activeHeight = audioLevel > 0.05 
            ? baseHeight * (0.5 + Math.random() * audioLevel * 2) 
            : baseHeight * 0.3;
            
          return (
            <div 
              key={i}
              className={`w-1.5 md:w-2 rounded-full transition-all duration-75 ${darkMode ? 'bg-gray-400' : 'bg-triagen-secondary'}`}
              style={{ 
                height: `${Math.max(15, Math.min(100, activeHeight))}%`,
                opacity: 1 - (distanceFromCenter * 0.15)
              }}
            />
          );
        })}
      </div>
    );
  };

  if (!isConnected && !error) {
     return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-triagen-neutral text-triagen-primary'}`}>
           <div className="w-12 h-12 rounded-full border-2 border-triagen-primary border-t-transparent animate-spin mb-4" />
           <p className="font-sans text-sm uppercase tracking-widest text-triagen-secondary">Orchestrating Session...</p>
        </div>
     );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-triagen-neutral text-triagen-primary'}`}>
      
      {/* Remote Tracks Container (Hidden) */}
      <div className="hidden">
        {remoteAudioTracks.map((track, idx) => (
          <RemoteAudioTrackComponent key={track.sid || idx} track={track} />
        ))}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-6">
           <StatusMessage type="error" message={error} darkMode={darkMode} />
        </div>
      ) : (
        <>
          {/* Header */}
          <header className={`absolute top-0 w-full z-10 p-6 md:px-12 flex justify-between items-center`}>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-heading font-semibold tracking-tight">TriaGen</h1>
              <span className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-sm italic font-serif ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>Senior Experience Designer</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-triagen-secondary'}`}>
                 <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-triagen-primary'} animate-pulse`} />
                 {formatTime(elapsedTime)}
              </div>
              <button className={`p-2 transition-colors ${darkMode ? 'hover:text-white' : 'hover:text-black'}`}>
                <Settings strokeWidth={1.5} className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Stage */}
          <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16 max-w-4xl mx-auto w-full text-center">
            
            {/* Audio Visualization */}
            {renderAudioBars()}

            <div className="space-y-4 mb-20 md:mb-32">
               <p className={`text-xs uppercase tracking-[0.2em] font-semibold ${darkMode ? 'text-gray-500' : 'text-triagen-secondary'}`}>Agent Inquiry</p>
               
               {isPaused ? (
                  <h2 className={`text-3xl md:text-5xl font-heading font-normal leading-tight mx-auto max-w-3xl italic ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    Session Paused.
                  </h2>
               ) : (
                  <h2 className={`text-3xl md:text-5xl font-heading font-normal leading-tight mx-auto max-w-3xl ${darkMode ? 'text-white' : 'text-triagen-primary'}`}>
                    "How do you balance user advocacy with business constraints in a high-growth environment?"
                  </h2>
               )}

               <div className={`flex items-center justify-center text-xs tracking-wider uppercase mt-8 ${audioLevel > 0.05 ? 'text-triagen-primary' : 'text-gray-400'}`}>
                 <Mic className="w-3 h-3 mr-2" /> 
                 {audioLevel > 0.05 ? 'Listening...' : 'Awaiting Input'}
               </div>
            </div>
          </main>

          {/* Bottom Dock Navigation */}
          <div className="absolute bottom-12 w-full flex justify-center z-10 px-4">
             <div className={`flex items-center gap-2 md:gap-4 p-2 rounded-2xl shadow-sm border ${darkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-md' : 'bg-white/90 border-neutral-200 backdrop-blur-md'}`}>
                
                {/* Pause Button */}
                <button 
                  onClick={togglePause}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-700' : 'bg-neutral-100/50 hover:bg-neutral-100'} ${isPaused ? 'bg-yellow-100/50 !text-yellow-600' : ''}`}
                >
                  {isPaused ? <Play strokeWidth={1.5} className="w-6 h-6 mb-2" /> : <Pause strokeWidth={1.5} className="w-6 h-6 mb-2" />}
                  <span className="text-[0.65rem] uppercase tracking-widest font-semibold">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                {/* Mute Button */}
                <button 
                  onClick={toggleMute}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl transition-colors ${isMuted ? 'bg-red-50 text-red-600' : darkMode ? 'hover:bg-gray-700' : 'bg-neutral-100/50 hover:bg-neutral-100'}`}
                >
                  {isMuted ? <MicOff strokeWidth={1.5} className="w-6 h-6 mb-2" /> : <Mic strokeWidth={1.5} className="w-6 h-6 mb-2" />}
                  <span className="text-[0.65rem] uppercase tracking-widest font-semibold">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <div className={`w-px h-12 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-neutral-200'}`} />

                {/* End Session Button */}
                <button 
                  onClick={disconnect}
                  className={`flex flex-col items-center justify-center w-24 h-20 rounded-xl transition-colors text-red-500 ${darkMode ? 'hover:bg-red-500/10' : 'bg-red-50 hover:bg-red-100'}`}
                >
                  <PhoneOff strokeWidth={1.5} className="w-6 h-6 mb-2" />
                  <span className="text-[0.65rem] uppercase tracking-widest font-semibold text-red-600">End Session</span>
                </button>

             </div>
          </div>

          {/* Bottom Tags */}
          <div className="absolute bottom-6 w-full px-6 md:px-12 flex justify-between items-center text-[0.65rem] tracking-widest uppercase font-semibold text-gray-400">
             <span>Secure Session • TriaGen Intelligence</span>
             <div className="flex gap-4">
                <span className="cursor-pointer hover:text-black transition-colors">Support</span>
                <span className="cursor-pointer hover:text-black transition-colors">Privacy</span>
             </div>
          </div>

        </>
      )}
    </div>
  );
}

export default InterviewRoom;
