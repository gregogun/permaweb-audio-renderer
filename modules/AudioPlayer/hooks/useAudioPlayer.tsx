import { useEffect, useRef, useState } from "react";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [duration, setDuration] = useState<number>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [scrubbedValue, setScrubbedValue] = useState<number | undefined>(
    undefined
  );
  const [scrubbing, setScrubbing] = useState<boolean>();

  useEffect(() => {
    // set audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    // set gain node
    if (!gainRef.current) {
      gainRef.current = audioCtxRef.current.createGain();
    }

    // set media element source
    if (!sourceRef.current) {
      sourceRef.current = audioCtxRef.current.createMediaElementSource(
        audioRef.current as HTMLMediaElement
      );
      sourceRef.current
        .connect(gainRef.current)
        .connect(audioCtxRef.current.destination);
    }
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current || !audioCtxRef.current) return;

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    }

    if (!playing && audioRef.current.readyState >= 2) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  // set duration
  useEffect(() => {
    const seconds = Math.floor(audioRef.current?.duration || 0);
    setDuration(seconds);
    const current = Math.floor(audioRef.current?.currentTime || 0);
    setCurrentTime(current);
  }, [audioRef.current?.onloadeddata, audioRef.current?.readyState]);

  // listeners
  useEffect(() => {
    if (audioRef.current) {
      // if audio has ended
      audioRef.current.addEventListener("ended", handleEnded);
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  const handleEnded = () => {
    setPlaying(false);
  };

  const handleTimeUpdate = () => {
    // check for current runs in useffect
    setCurrentTime(audioRef.current?.currentTime as number);
  };

  return {
    audioRef,
    gainRef,
    audioCtxRef,
    duration,
    currentTime,
    playing,
    scrubbing,
    scrubbedValue,
    handlePlayPause,
    setScrubbing,
    setCurrentTime,
    setScrubbedValue,
  };
};