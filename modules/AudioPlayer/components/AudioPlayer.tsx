import { Tracklist } from "@/types";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@/ui/Slider";
import { abbreviateAddress, formatTime } from "@/utils";
import { Flex, IconButton, styled, Typography } from "@aura-ui/react";
import { KeyboardEvent, useEffect, useState } from "react";
import {
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";
import { MdVolumeDown, MdVolumeUp } from "react-icons/md";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const PlayPauseButton = styled(IconButton, {
  br: 9999,
});

const SkipButton = styled(IconButton, {
  br: 9999,
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

export const AudioPlayer = ({ tracklist }: { tracklist: Tracklist }) => {
  const [progressStep, setProgressStep] = useState<number>(0.01);
  // const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const {
    audioRef,
    gainRef,
    audioCtxRef,
    ready,
    playing,
    duration,
    currentTime,
    scrubbing,
    setScrubbing,
    scrubbedValue,
    setScrubbedValue,
    setCurrentTime,
    handlePlayPause,
    currentTrackIndex,
    handleNextTrack,
    handlePrevTrack,
  } = useAudioPlayer(tracklist);

  useEffect(() => {
    console.log("tracklist", tracklist);
  }, []);

  /* VARS */

  const currentTrack = tracklist[currentTrackIndex];

  /* EVENT HANDLERS */

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
        br: "$5",
        width: "$$width",
        overflow: "hidden",
      }}
      direction="column"
      gap="5"
    >
      <audio ref={audioRef}>
        <source src={currentTrack.src} type="audio/ogg" />
        <source src={currentTrack.src} type="audio/wav" />
        <source src={currentTrack.src} type="audio/mpeg" />
        <source src={currentTrack.src} type="audio/aac" />
        <Typography>Audio file type not supported.</Typography>
      </audio>

      <CoverArtwork src={currentTrack.artworkSrc} />

      <Flex css={{ mt: "-$2" }} direction="column">
        <Typography weight="6" contrast="hiContrast">
          {currentTrack.name ? currentTrack.name : "(Untitled)"}
        </Typography>
        <Typography size="2">
          {abbreviateAddress({
            address: currentTrack.creator,
            options: { endChars: 5, noOfEllipsis: 3 },
          })}
        </Typography>
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
        align="center"
        gap="3"
      >
        <SkipButton
          onClick={handlePrevTrack}
          css={{
            svg: {
              size: "$6",
            },
          }}
          variant="ghost"
          disabled={tracklist.length < 2}
        >
          <MdSkipPrevious />
        </SkipButton>
        <PlayPauseButton
          css={{
            color: "$blackA12",
            backgroundColor: "$whiteA12",

            "& svg": {
              size: "$6",
            },

            "&:hover": {
              backgroundColor: "hsla(0, 0%, 100%, 0.857)",
            },

            "&:active": {
              backgroundColor: "hsla(0, 0%, 100%, 0.648)",
            },
          }}
          size="3"
          data-playing={playing}
          aria-checked={playing}
          // disabled={!ready}
          role="switch"
          onClick={handlePlayPause}
        >
          {playing ? <MdPause /> : <MdPlayArrow />}
        </PlayPauseButton>
        <SkipButton
          onClick={handleNextTrack}
          css={{
            svg: {
              size: "$6",
            },
          }}
          variant="ghost"
          disabled={tracklist.length < 2}
        >
          <MdSkipNext />
        </SkipButton>
      </ControlsContainer>

      <Flex
        css={{
          "& svg": {
            size: "$5",
          },
        }}
        align="center"
        justify="center"
        gap="3"
      >
        <MdVolumeDown />
        <VolumeContainer
          css={{
            width: "100%",
            flex: 1,
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
