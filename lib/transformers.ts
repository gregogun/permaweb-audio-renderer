import { Track, Tracklist } from "@/types";
import { abbreviateAddress, accountFromAddress, boringAvatars } from "@/utils";
import arweaveGql from "arweave-graphql";

export const getTxData = async (gateway: string, txid: string) => {
  const res = await arweaveGql(`${gateway}/graphql`).getTransactions({
    ids: [txid],
    tags: [
      {
        name: "Content-Type",
        values: [
          "audio/mpeg",
          "audio/wav",
          "audio/aac",
          //  "application/x.arweave-manifest+json"
        ],
      },
    ],
  });

  return res.transactions.edges.map((edge) => ({
    owner: edge.node.owner,
    tags: edge.node.tags,
    id: edge.node.id,
  }));
};

export const setTrackInfo = async (gateway: string, txid: string) => {
  try {
    const data = await getTxData(gateway, txid);

    // console.log("data", data);

    // const tags = data[0].tags;

    // const id = data[0].id;
    // const trackName = tags.find((tag) => tag.name === "Title")?.value;
    // const artworkSrc = tags.find((tag) => tag.name === "Thumbnail")?.value;

    // /* check if user has profile data, otherwise fallback to address */
    // const owner = await accountFromAddress(data[0].owner.address).then(
    //   (account) => {
    //     if (account) {
    //       return account.profile.handleName || account?.handle;
    //     } else {
    //       return abbreviateAddress({
    //         address: data[0].owner.address,
    //         options: { endChars: 5, noOfEllipsis: 3 },
    //       });
    //     }
    //   }
    // );

    const tracklist = await Promise.all(
      data.map(async (track) => {
        const tags = track.tags;

        const id = track.id;
        const trackName = tags.find((tag) => tag.name === "Title")?.value;
        const artworkSrc = tags.find((tag) => tag.name === "Thumbnail")?.value;

        const owner = await accountFromAddress(track.owner.address).then(
          (account) => {
            if (account && account.profile.handleName) {
              return account.profile.handleName;
            } else {
              return abbreviateAddress({
                address: track.owner.address,
                options: { endChars: 5, noOfEllipsis: 3 },
              });
            }
          }
        );

        return {
          name: trackName,
          src: `${gateway}/${id}`,
          creator: owner,
          artworkSrc: artworkSrc
            ? `${gateway}/${artworkSrc}`
            : boringAvatars(id),
        };
      })
    );

    // const trackInfo: Track = {
    //   name: trackName,
    //   src: `${gateway}/${id}`,
    //   creator: owner,
    //   artworkSrc: artworkSrc ? `${gateway}/${artworkSrc}` : boringAvatars(id),
    // };

    console.log(tracklist);

    return tracklist;
  } catch (error) {
    console.error(error);
    throw new Error(error as unknown as string);
  }
};
