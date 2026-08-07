import { useEffect, useRef, useState, useCallback } from "react";

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragValue = useRef(0);
  const raf = useRef(0);

  const tick = useCallback(() => {
    if (!audioRef.current || dragging) return;
    setCurrent(audioRef.current.currentTime);
    raf.current = requestAnimationFrame(tick);
  }, [dragging]);

  useEffect(() => {
    if (playing) {
      raf.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf.current);
    }
    return () => cancelAnimationFrame(raf.current);
  }, [playing, tick]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }, []);

  const onLoaded = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setDuration(a.duration || 0);
  }, []);

  const onEnded = useCallback(() => {
    setPlaying(false);
    setCurrent(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, []);

  const onProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      dragValue.current = v;
      setCurrent(v);
    },
    []
  );

  const onProgressDown = useCallback(() => {
    setDragging(true);
  }, []);

  const onProgressUp = useCallback(() => {
    setDragging(false);
    const a = audioRef.current;
    if (a) {
      a.currentTime = dragValue.current;
      setCurrent(a.currentTime);
    }
  }, []);

  const fmt = (t: number) => {
    if (!Number.isFinite(t) || t <= 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="pm-audio-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={onLoaded}
        onEnded={onEnded}
      />
      <button
        className="pm-audio-play"
        onClick={toggle}
        aria-label={playing ? "暂停" : "播放"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="5" height="18" rx="1" />
            <rect x="14" y="3" width="5" height="18" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 3.5v17l13-8.5z" />
          </svg>
        )}
      </button>
      <input
        type="range"
        className="pm-audio-slider"
        min={0}
        max={duration || 0}
        step={0.1}
        value={dragging ? dragValue.current : current}
        onChange={onProgressChange}
        onMouseDown={onProgressDown}
        onMouseUp={onProgressUp}
        onTouchStart={onProgressDown}
        onTouchEnd={onProgressUp}
        style={{
          backgroundSize: `${duration > 0 ? ((dragging ? dragValue.current : current) / duration) * 100 : 0}% 100%`,
        }}
      />
      <span className="pm-audio-time">{fmt(dragging ? dragValue.current : current)}</span>
    </div>
  );
}
