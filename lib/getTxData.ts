import arweaveGql from "arweave-graphql";

export const getTxData = async (txid: string) => {
  const res = await arweaveGql("https://arweave.net/graphql").getTransactions({
    ids: [txid],
    tags: [
      {
        name: "Content-Type",
        values: ["audio/mpeg", "audio/wav", "audio/aac"],
      },
    ],
  });

  return res.transactions.edges.map((node) => ({
    owner: node.node.owner,
    tags: node.node.tags,
  }));
};
