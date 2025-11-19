import { useEffect, useRef } from 'react';
import { RemoteAudioTrack as LiveKitRemoteAudioTrack } from 'livekit-client';

interface RemoteAudioTrackProps {
    track: LiveKitRemoteAudioTrack;
    volume?: number;
}

export default function RemoteAudioTrack({ track, volume = 1.0 }: RemoteAudioTrackProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        // Attach the track to the audio element
        track.attach(audioElement);

        // Ensure volume is set
        audioElement.volume = volume;

        // Attempt to play (handle autoplay policy)
        const playAudio = async () => {
            try {
                await audioElement.play();
                console.log(`🔊 Audio started for track ${track.sid}`);
            } catch (err) {
                console.warn(`⚠️ Autoplay failed for track ${track.sid}:`, err);
            }
        };

        playAudio();

        return () => {
            // Detach on unmount
            track.detach(audioElement);
        };
    }, [track, volume]);

    // Update volume if it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return <audio ref={audioRef} autoPlay playsInline />;
}
