import Arweave from "arweave";
import { ArweaveWebWallet } from "arweave-wallet-connector";
import ArweaveAccount, { ArAccount } from "arweave-account";
import { WarpFactory } from "warp-contracts";

export const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export const webWallet = new ArweaveWebWallet({
  name: "your_app_name_here",
});

export const warp = WarpFactory.forMainnet();

export const connect = () => {
  webWallet.setUrl("https://arweave.app");
  return webWallet.connect();
};

export const account = new ArweaveAccount();

export const getAccount = async (address: string) => {
  try {
    const acc: ArAccount = await account.get(address);
    if (acc) {
      return acc;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAccountHandle = async (handle: string) => {
  return await account.search(handle);
};
