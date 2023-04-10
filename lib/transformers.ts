import { Manifest } from "@/types";
import { accountFromAddress, boringAvatars } from "@/utils";
import arweaveGql from "arweave-graphql";
import { arweave } from "./arweave";

const getManifestData = async (
  gateway: string,
  owner: string,
  manifestId: string
) => {
  const res = await arweaveGql(`${gateway}/graphql`).getTransactions({
    owners: [owner],
    tags: [
      {
        name: "Content-Type",
        values: ["application/json"],
      },
      {
        name: "Manifest",
        values: [manifestId],
      },
    ],
  });

  const jsonRes = await arweave.api.get(res.transactions.edges[0].node.id);
  const data: Manifest = await jsonRes.json();

  return data;
};

const getTxData = async (gateway: string, txids: string[]) => {
  const res = await arweaveGql(`${gateway}/graphql`).getTransactions({
    ids: txids,
    tags: [
      {
        name: "Content-Type",
        values: [
          "audio/mpeg",
          "audio/wav",
          "audio/aac",
          "application/x.arweave-manifest+json",
        ],
      },
    ],
  });

  return await Promise.all(
    res.transactions.edges.map(async (edge) => {
      if (edge.node.data.type === "application/x.arweave-manifest+json") {
        return {
          owner: edge.node.owner,
          tags: edge.node.tags,
          id: edge.node.id,
          type: edge.node.data.type,
        };
      }

      return {
        owner: edge.node.owner,
        tags: edge.node.tags,
        id: edge.node.id,
      };
    })
  );
};

export const setTrackInfo = async (gateway: string, txid: string) => {
  try {
    const data = await getTxData(gateway, [txid]);

    console.log("data", data);

    const tracklist = await Promise.all(
      data.map(async (res) => {
        // get owner account if exists
        const owner = await accountFromAddress(res.owner.address).then(
          (account) => {
            if (account && account.profile.handleName) {
              return account.profile.handleName;
            } else {
              return res.owner.address;
            }
          }
        );

        // check for manifest
        if (res.type && res.type === "application/x.arweave-manifest+json") {
          // fetch manifest and optimistically render using path names to figure out content type
          const manifestData = await getManifestData(
            gateway,
            res.owner.address,
            res.id
          );
          const paths = manifestData.paths;
          console.log("manifest", manifestData);

          let thumbnail = "";

          for (const key in paths) {
            // update with list of accepted image types using 'Array.some' method
            if (key.includes("jpeg")) {
              thumbnail = paths[key].id;
            }
          }

          let ids = [];
          let tracks = [];

          for (const key in paths) {
            // create vars to be appended value
            let id = "";

            // update with list of accepted audio types using 'Array.some' method
            if (key.includes("mp3")) {
              id = paths[key].id;
            }

            if (id) {
              tracks.push({
                name: key.split(".")[0],
                src: `${gateway}/${id}`,
                creator: owner,
                artworkSrc: thumbnail
                  ? `${gateway}/${thumbnail}`
                  : boringAvatars(id),
              });
            } else {
              ids.push(id);
            }
          }
          if (tracks.length > 0) {
            return tracks;
          } else {
            // if optimistic render fails, fetch path data and render
            const data = await getTxData(gateway, ids);

            const tracks = data.map((res) => {
              const tags = res.tags;

              const id = res.id;
              const trackName = tags.find((tag) => tag.name === "Title")?.value;
              const artworkSrc =
                thumbnail ||
                tags.find((tag) => tag.name === "Thumbnail")?.value;

              return {
                name: trackName,
                src: `${gateway}/${id}`,
                creator: owner,
                artworkSrc: artworkSrc
                  ? `${gateway}/${artworkSrc}`
                  : boringAvatars(id),
              };
            });
            return tracks;
          }
        }

        const tags = res.tags;

        const id = res.id;
        const trackName = tags.find((tag) => tag.name === "Title")?.value;
        const artworkSrc = tags.find((tag) => tag.name === "Thumbnail")?.value;

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

    // console.log(tracklist);

    // flatten array to prevent nested array
    return tracklist.flat();
  } catch (error) {
    console.error(error);
    throw new Error(error as unknown as string);
  }
};
