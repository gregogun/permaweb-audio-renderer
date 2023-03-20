import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@/ui/Slider";
import { formatTime } from "@/utils";
import { Flex, Grid, IconButton, styled, Typography } from "@aura-ui/react";
import { KeyboardEvent, useState } from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { MdVolumeDown, MdVolumeUp } from "react-icons/md";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

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

interface AudioPlayerProps {
  txid: string | undefined;
  gateway?: string;
}

export const AudioPlayer = ({
  txid,
  gateway = "https://arweave.net",
}: AudioPlayerProps) => {
  const [progressStep, setProgressStep] = useState<number>(0.01);
  const {
    audioRef,
    gainRef,
    audioCtxRef,
    playing,
    duration,
    currentTime,
    setCurrentTime,
    scrubbing,
    setScrubbing,
    scrubbedValue,
    setScrubbedValue,
    handlePlayPause,
  } = useAudioPlayer();

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

      <Flex
        css={{
          width: "300px",

          "& svg": {
            size: "$5",
          },
        }}
        align="center"
        justify="center"
        gap="2"
      >
        <MdVolumeDown />
        <VolumeContainer
          css={{
            minWidth: 200,
          }}
        >
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
        <MdVolumeUp />
      </Flex>
    </AudioContainer>
  );
};
