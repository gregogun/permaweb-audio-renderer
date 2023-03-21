export type Track = {
  name: string | undefined;
  creator: string;
  src: string;
  artworkSrc: string | undefined;
};

export type Tracklist = Track[];
