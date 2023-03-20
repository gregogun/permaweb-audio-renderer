import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@/ui/Slider";
import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  styled,
  Typography,
} from "@aura-ui/react";
import {
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { RiVolumeDownFill, RiVolumeUpFill } from "react-icons/ri";

const PlayPauseButton = styled(IconButton, {
  br: 9999,
  backgroundColor: "$whiteA12",
  color: "$blackA12",

  "& svg": {
    size: "$6",
  },

  "&:hover": {
    backgroundColor: "hsla(0, 0%, 100%, 0.857)",
  },

  "&:active": {
    backgroundColor: "hsla(0, 0%, 100%, 0.648)",
  },
});

const Slider = styled(SliderRoot, {
  width: "100%",

  '[data-slider-thumb="true"]': {
    opacity: 0,
  },

  "&:hover": {
    '[data-slider-thumb="true"]': {
      opacity: 1,
    },
  },

  "&:focus-within": {
    '[data-slider-thumb="true"]': {
      "&:focus-visible": {
        opacity: 1,
      },
    },
  },
});

const AudioContainer = styled(Flex);
const VolumeSlider = styled(Slider);
const VolumeContainer = styled("form");
const ControlsContainer = styled(Flex);
const ProgressSlider = styled(Slider);
const ProgressContainer = styled("form");
const CoverArtwork = styled("img", {
  height: "$$width",
  br: "$3",
  objectFit: "cover",
  objectPosition: "center",
});

export const Audio = () => {
  const audioRef = useRef<HTMLMediaElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [duration, setDuration] = useState<number>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [progressStep, setProgressStep] = useState<number>(0.01);
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

  const handleValueChange = (e: number[]) => {
    if (!gainRef.current) return;

    gainRef.current.gain.value = e[0] / 100;
  };

  const handleProgressChange = (e: number[]) => {
    if (!audioRef.current) return;

    setScrubbing(true);
    setScrubbedValue(e[0]);
  };

  const handleProgressCommit = (e: number[]) => {
    if (!audioRef.current) return;

    setScrubbing(false);
    audioRef.current.currentTime = e[0];
    setCurrentTime(e[0]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setProgressStep(5);
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

  // function formatTime(currentTime: number) {
  //   const hours = Math.floor(currentTime / 3600);
  //   const minutes = Math.floor((currentTime % 3600) / 60);
  //   const seconds = Math.floor(currentTime % 60);

  //   const hourString = hours > 0 ? hours.toString().padStart(2, "0") + ":" : "";
  //   const minuteString = minutes.toString().padStart(1, "0");
  //   const secondString = seconds.toString().padStart(2, "0");

  //   if (hours > 0) {
  //     return hourString + minuteString + ":" + secondString;
  //   } else {
  //     return minuteString + ":" + secondString;
  //   }
  // }

  function formatTime(time: number): string {
    const minutes: number = Math.floor(time / 60) % 60;
    const seconds: number = Math.floor(time % 60);
    const hours: number = Math.floor(time / 3600);

    const formattedSeconds: string = `${seconds < 10 ? "0" : ""}${seconds}`;

    if (hours > 0) {
      return `${hours}:${minutes}:${formattedSeconds}`;
    }

    return `${minutes}:${formattedSeconds}`;
  }

  return (
    <AudioContainer
      css={{
        $$width: "300px",

        backgroundColor: "$slate2",
        p: "$5",
        br: "$3",
        width: "$$width",
        overflow: "hidden",
      }}
      direction="column"
      gap="3"
    >
      <audio ref={audioRef}>
        <source src="./Transcend.ogg" type="audio/ogg" />
        <source src="./Transcend.wav" type="audio/wav" />
        <source src="./Transcend.mp3" type="audio/mpeg" />
        <Typography>Audio file type not supported.</Typography>
      </audio>

      <CoverArtwork src="giphy.webp" />

      <Flex direction="column">
        <Typography weight="6" contrast="hiContrast">
          Transcend
        </Typography>
        <Typography size="2">gregoriousbeats</Typography>
      </Flex>

      <Flex
        css={{
          position: "relative",
        }}
        direction="column"
      >
        <ProgressContainer>
          <ProgressSlider
            onKeyDown={handleKeyDown}
            defaultValue={[
              audioCtxRef.current ? audioCtxRef.current.currentTime : 0,
            ]}
            value={scrubbing ? [scrubbedValue as number] : [currentTime]}
            max={duration}
            step={progressStep}
            aria-label="Track Progress"
            onValueChange={(e) => handleProgressChange(e)}
            onValueCommit={handleProgressCommit}
          >
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb data-slider-thumb />
          </ProgressSlider>
        </ProgressContainer>
        <Flex
          css={{
            position: "absolute",
            top: "$5",
            width: "100%",
          }}
          justify="between"
        >
          <Typography size="1">
            {scrubbing
              ? formatTime(scrubbedValue as number)
              : formatTime(currentTime)}
          </Typography>
          <Typography size="1">
            {duration && !isNaN(duration) ? formatTime(duration) : `0:00`}
          </Typography>
        </Flex>
      </Flex>

      <ControlsContainer
        css={{
          mx: "auto",
          my: "$3",
        }}
      >
        <PlayPauseButton
          size="3"
          data-playing={playing}
          aria-checked={playing}
          role="switch"
          onClick={handlePlayPause}
        >
          {playing ? <MdPause /> : <MdPlayArrow />}
        </PlayPauseButton>
      </ControlsContainer>

      <Grid
        css={{
          gridTemplateColumns: "20px 1fr 20px",
          width: "80%",
          mx: "auto",
          alignItems: "center",
        }}
        gap="2"
      >
        <RiVolumeDownFill />
        <VolumeContainer>
          <VolumeSlider
            defaultValue={[
              gainRef.current ? gainRef.current.gain.value / 100 : 100,
            ]}
            max={100}
            step={progressStep}
            aria-label="Volume"
            onValueChange={(e) => handleValueChange(e)}
            onKeyDown={handleKeyDown}
          >
            <SliderTrack>
              <SliderRange />
            </SliderTrack>
            <SliderThumb data-slider-thumb />
          </VolumeSlider>
        </VolumeContainer>
        <RiVolumeUpFill />
      </Grid>
    </AudioContainer>
  );
};
