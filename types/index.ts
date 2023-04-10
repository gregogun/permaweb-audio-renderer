export type Track = {
  name: string | undefined;
  creator: string;
  src: string;
  artworkSrc: string;
};

export type Tracklist = Track[];

type ManifestPath = {
  id: string;
};

export type Manifest = {
  index?: {
    path: string;
  };
  paths: {
    [key: string]: ManifestPath;
  };
};

export type ValidTrack = {};
