import { useState, useEffect, useRef } from 'react';
import { LocalAudioTrack } from 'livekit-client';

function useAudioLevel(track: LocalAudioTrack | null) {
  const [level, setLevel] = useState(0);
  const envelopeRef = useRef(0);

  useEffect(() => {
    if (!track) {
      setLevel(0);
      envelopeRef.current = 0;
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const dataArray = new Uint8Array(analyser.fftSize);

    const mediaStream = new MediaStream([track.mediaStreamTrack]);
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    let rafId: number;
    const update = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const gated = rms < 0.01 ? 0 : rms; // noise gate
      const alpha = gated > envelopeRef.current ? 0.4 : 0.2; // fast attack, fast release
      envelopeRef.current = alpha * envelopeRef.current + (1 - alpha) * gated;
      setLevel(Math.min(envelopeRef.current * 400, 100));
      rafId = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(rafId);
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [track]);

  return level;
}

export default useAudioLevel;
