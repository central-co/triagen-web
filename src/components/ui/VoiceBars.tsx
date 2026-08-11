import { useEffect, useRef } from 'react';
import type { LocalAudioTrack } from 'livekit-client';

interface VoiceBarsProps {
  track: LocalAudioTrack | null;
  muted: boolean;
  darkMode: boolean;
  /** Fired only when speech starts or stops — never on every frame. */
  onSpeakingChange?: (speaking: boolean) => void;
}

const BARS = 9;
const CENTER = Math.floor(BARS / 2);
/** Speech energy sits in the lower spectrum; the top bins are mostly silence. */
const VOICE_BIN_RATIO = 0.45;
/** Hysteresis so the caption doesn't flicker between words. */
const SPEAK_ON = 0.14;
const SPEAK_OFF = 0.07;
const RELEASE_MS = 350;
const REST_SCALE = 0.08;

/**
 * Live voice meter for the interview room.
 *
 * The animation runs entirely outside React: the frame loop writes `scaleY`
 * straight to each bar, so a 60fps meter never re-renders the page. Heights come
 * from the analyser's frequency bands — the bars track the candidate's actual
 * voice instead of approximating it with noise.
 */
function VoiceBars({ track, muted, darkMode, onSpeakingChange }: Readonly<VoiceBarsProps>) {
  const barsRef = useRef<Array<HTMLDivElement | null>>([]);
  const speakingRef = useRef(false);
  const callbackRef = useRef(onSpeakingChange);
  callbackRef.current = onSpeakingChange;

  useEffect(() => {
    const bars = barsRef.current;

    const setSpeaking = (value: boolean) => {
      if (speakingRef.current === value) return;
      speakingRef.current = value;
      callbackRef.current?.(value);
    };

    const rest = () => bars.forEach(bar => {
      if (bar) bar.style.transform = `scaleY(${REST_SCALE})`;
    });

    if (!track || muted) {
      rest();
      setSpeaking(false);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    // Heavier smoothing under reduced motion: the meter still reports, but calmly.
    analyser.smoothingTimeConstant = reduceMotion ? 0.88 : 0.6;

    const bins = new Uint8Array(analyser.frequencyBinCount);
    const source = context.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
    source.connect(analyser);

    // One band per distance-from-centre, so the meter stays symmetric.
    const bandCount = CENTER + 1;
    const envelopes = new Array<number>(bandCount).fill(0);
    const usableBins = Math.floor(bins.length * VOICE_BIN_RATIO);
    const binsPerBand = Math.max(1, Math.floor(usableBins / bandCount));
    const amplitude = reduceMotion ? 0.55 : 0.92;

    let holdUntil = 0;
    let frameId = 0;

    const frame = () => {
      analyser.getByteFrequencyData(bins);

      let total = 0;
      for (let band = 0; band < bandCount; band++) {
        let sum = 0;
        const start = band * binsPerBand;
        for (let bin = start; bin < start + binsPerBand; bin++) sum += bins[bin];
        const magnitude = sum / binsPerBand / 255;
        total += magnitude;

        // Fast attack, slow release — the shape of a voice, not of noise.
        const coefficient = magnitude > envelopes[band] ? 0.5 : 0.12;
        envelopes[band] += (magnitude - envelopes[band]) * coefficient;
      }

      for (let i = 0; i < BARS; i++) {
        const bar = bars[i];
        if (!bar) continue;
        const band = Math.abs(i - CENTER);
        const scale = REST_SCALE + Math.min(1, envelopes[band] * 2.6) * amplitude;
        bar.style.transform = `scaleY(${scale.toFixed(3)})`;
      }

      const level = total / bandCount;
      const now = performance.now();
      if (level > SPEAK_ON) {
        holdUntil = now + RELEASE_MS;
        setSpeaking(true);
      } else if (now > holdUntil && level < SPEAK_OFF) {
        setSpeaking(false);
      }

      frameId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(frameId);
      source.disconnect();
      analyser.disconnect();
      context.close();
      rest();
      setSpeaking(false);
    };
  }, [track, muted]);

  return (
    <div
      className="flex items-center justify-center gap-1.5 md:gap-2.5 h-32 mb-12"
      aria-hidden="true"
    >
      {Array.from({ length: BARS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className={`w-1.5 md:w-2 h-full rounded-full will-change-transform ${
            darkMode ? 'bg-gray-400' : 'bg-triagen-secondary'
          }`}
          style={{
            transform: `scaleY(${REST_SCALE})`,
            opacity: 1 - Math.abs(i - CENTER) * 0.13,
          }}
        />
      ))}
    </div>
  );
}

export default VoiceBars;
