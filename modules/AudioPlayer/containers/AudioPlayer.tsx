import { setTrackInfo } from "@/lib/transformers";
import { Track } from "@/types";
import { Typography } from "@aura-ui/react";
import { useEffect, useState } from "react";
import { AudioPlayer as Component } from "../components/AudioPlayer";

interface AudioPlayerProps {
  txid: string | undefined;
  gateway?: string;
}

export const AudioPlayer = ({
  txid,
  gateway = "https://arweave.net",
}: AudioPlayerProps) => {
  const [error, setError] = useState<string>();
  const [track, setTrack] = useState<Track>();

  /* will update to tracklist once manifests supported */
  // const [tracklist, setTracklist] = useState<Track[]>()

  /* FETCH TX & TRANSFORM DATA */

  useEffect(() => {
    fetchAndTransform();
  }, []);

  const fetchAndTransform = async () => {
    if (!txid) return;

    try {
      const data = await setTrackInfo(gateway, txid);
      setTrack(data);
    } catch (error) {
      console.error(error);
      setError(
        "An error occured trying to fetch your data. Please check you are entering a valid transaction ID."
      );
    }
  };

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (!txid || !track) {
    return null;
  }

  return (
    <Component
      src={track.src}
      name={track.name}
      creator={track.creator}
      artworkSrc={track.artworkSrc}
    />
  );
};
