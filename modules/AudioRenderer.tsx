import { getAccountHandle, getAccount } from "@/lib/arweave";
import { getTxData } from "@/lib/getTxData";
import { Loader } from "@/ui/Loader";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@/ui/Slider";
import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  styled,
  Typography,
} from "@aura-ui/react";
import { ArAccount } from "arweave-account";
import { Owner, Tag } from "arweave-graphql";
import {
  PlayerProvider,
  Player,
  VolumeSlider,
  PlayerSlider,
} from "headless-audioplayer-react";
import { useEffect, useState } from "react";
import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { MdPause, MdPlayArrow } from "react-icons/md";
import {
  RiVolumeMuteFill,
  RiVolumeDownFill,
  RiVolumeUpFill,
} from "react-icons/ri";

const Image = styled("img", {
  width: "100%",
  height: "100%",
  br: "$2",
});

const StyledVolumeSlider = styled("input", {
  "&[type=range]": {
    $$height: "6px",

    mt: -1,
    appearance: "none",
    br: "$pill",
    position: "relative",
    width: "100%",
    height: "$$height",
    outline: "none",

    "&::before": {
      content: '""',
      height: "$$height",
      width: 100,
      backgroundColor: "$slate12",
      br: "$pill",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2,
    },

    // safari styles
    "&::-webkit-slider-runnable-track": {
      backgroundColor: "$slate5",
      br: "$pill",
      position: "relative",
      width: "100%",
      height: "$$height",
      outline: "none",
    },

    // moz styles
    "&::-moz-range-track": {
      backgroundColor: "$slate5",
      br: "$pill",
      position: "relative",
      width: "100%",
      height: "$$height",
      outline: "none",
    },

    "&::-moz-focus-outer": {
      border: 0,
    },

    "&::-moz-range-progress": {
      backgroundColor: "$slate12",
      height: "$$height",
      br: "$pill",
    },

    "&::-webkit-slider-thumb": {
      "-webkit-appearance": "none",
      display: "none",
      size: "$4",
      br: "$round",
      border: "none",
      backgroundColor: "$slate12",
      position: "relative",
      mt: -5,
      zIndex: 3,
      boxSizing: "border-box",
    },

    "&:active::-webkit-slider-thumb": {
      outline: "none",
      boxShadow: `0 0 0 3px $colors$blackA5`,
      transform: "scale(1.05)",
    },

    // knob - firefox
    "&::-moz-range-thumb": {
      size: "$4",
      br: "$round",
      border: "transparent",
      backgroundColor: "$slate12",
      position: "relative",
      zIndex: 3,
      boxSizing: "border-box",
    },

    // knob active - firefox
    "&:active::-moz-range-thumb": {
      outline: "none",
      boxShadow: `0 0 0 3px $colors$blackA5`,
      transform: "scale(1.05)",
    },
  },
});

const gateway = "https://arweave.net";
const boringAvatars = (txid?: string) =>
  `https://source.boringavatars.com/marble/100/${txid}?square=true?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;

interface AudioRendererProps {
  txid: string | undefined;
}

export const AudioRenderer = ({ txid }: AudioRendererProps) => {
  const [error, setError] = useState<string>();
  const [data, setData] = useState<{ owner: Owner; tags: Tag[] }>();
  const [trackName, setTrackName] = useState<string>();
  const [creatorName, setCreatorName] = useState<string>();
  const [coverArtTx, setCoverArtTx] = useState<string>();

  interface AbbreviateAddressOptions {
    startChars?: number;
    endChars?: number;
    noOfEllipsis?: number;
  }

  interface AbbreviateAddress {
    address: string | undefined;
    options?: AbbreviateAddressOptions;
  }

  const accountFromAddress = async (
    address: string | undefined
  ): Promise<ArAccount | undefined> => {
    if (!address) {
      return;
    }
    const userAccount = await getAccount(address);

    return userAccount;
  };

  const abbreviateAddress = ({ address, options = {} }: AbbreviateAddress) => {
    const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

    const dot = ".";
    const firstFive = address?.substring(0, startChars);
    const lastFour = address?.substring(address.length - endChars);
    return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
  };

  const address = data?.owner
    ? abbreviateAddress({ address: data.owner.address })
    : "Unknown";

  const setInfo = async () => {
    const tags = data?.tags;
    tags?.forEach((tag) => {
      if (tag.name === "Title") {
        if (tag.value) {
          setTrackName(tag.value);
        }
      }
      if (tag.name === "Thumbnail") {
        if (tag.value) {
          setCoverArtTx(tag.value);
        }
      }
    });
    await accountFromAddress(data?.owner.address).then((account) => {
      if (account?.handle) {
        setCreatorName(account.profile.handleName || account.handle);
      } else {
        setCreatorName(address);
      }
    });
  };

  useEffect(() => {
    if (data) {
      setInfo();
    }
  }, [data]);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    if (!txid) {
      return;
    }

    // check for render with tag and validity of content types (only audio)
    try {
      const data = await getTxData(txid);
      //   console.log(data[0]);
      setData(data[0]);
    } catch (error) {
      setError(
        "Please provide a valid transaction ID in the url. e.g. `/?tx=asdfghjkl` "
      );
      console.error(error);
    }
  };

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (!txid) {
    return null;
  }

  return (
    <PlayerProvider src={`${gateway}/${txid}`}>
      <Player>
        {(context) => (
          <Flex
            css={{
              $$width: "$sizes$40",

              backgroundColor: "$slate2",
              p: "$4",
              pr: "$7",
              br: "$4",
            }}
            gap="5"
            // direction="column"
          >
            <Center
              css={{
                width: "$$width",
                height: "$$width",
                overflow: "hidden",
                position: "relative",
                objectFit: "cover",
              }}
            >
              <Image
                src={
                  coverArtTx ? `${gateway}/${coverArtTx}` : boringAvatars(txid)
                }
              />
              <IconButton
                size="3"
                css={{
                  br: 9999,
                  position: "absolute",
                  backgroundColor: "$colors$blackA8",
                  color: "$whiteA12",

                  "&:hover": {
                    backgroundColor: "$colors$blackA9",
                  },

                  "&:focus": {
                    boxShadow: "0 0 0 2px $colors$blackA9",
                  },
                }}
                onClick={context.togglePlay}
              >
                {context.isPlaying ? <MdPause /> : <MdPlayArrow />}
              </IconButton>
            </Center>
            <Center>
              <Flex
                css={{
                  width: "100%",
                }}
                justify="between"
              >
                <Box>
                  <Typography contrast="hiContrast" size="4" weight="6">
                    {trackName ? trackName : "(Untitled)"}
                  </Typography>
                  <Typography size="4">{creatorName}</Typography>
                </Box>
                <Flex
                  css={{
                    alignSelf: "start",
                  }}
                  justify="between"
                  align="center"
                  gap="1"
                >
                  <Box
                    css={{
                      color: "$slate12",
                      "& svg": {
                        size: 20,
                      },
                    }}
                    as="span"
                  >
                    {context.volume === 0 && <RiVolumeMuteFill />}
                    {context.volume > 0 && context.volume <= 0.6 && (
                      <RiVolumeDownFill />
                    )}

                    {context.volume > 0.6 && <RiVolumeUpFill />}
                  </Box>
                  <StyledVolumeSlider
                    css={{
                      "&[type=range]": {
                        "&::before": {
                          width: context.volume * 100 * 1.25,
                        },

                        "&:hover::-webkit-slider-thumb": {
                          display: "block",
                        },
                      },
                    }}
                    type="range"
                    onChange={context.onSliderVolumeChange}
                    value={context.volume === 1 ? "100" : undefined}
                  />
                </Flex>
              </Flex>
              <Box>
                <StyledVolumeSlider
                  css={{
                    "&[type=range]": {
                      minWidth: 400,
                      "&::before": {
                        width: context.progress * 4,
                      },

                      "&:hover::-webkit-slider-thumb": {
                        display: "block",
                      },
                    },
                  }}
                  type="range"
                  onChange={context.onSliderChange}
                  value={context.progress}
                  step="0.01"
                />
                <Flex css={{ my: "$1", px: "$1" }} justify="between">
                  <Typography size="1" as="span">
                    {context.timestamp.current}
                  </Typography>
                  <Typography size="1" as="span">
                    {context.timestamp.total}
                  </Typography>
                </Flex>
              </Box>
            </Center>
          </Flex>
        )}
      </Player>
    </PlayerProvider>
  );
};
