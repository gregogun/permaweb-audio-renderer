import { getAccount } from "@/lib/arweave";
import { ArAccount } from "arweave-account";

export const boringAvatars = (txid?: string) =>
  `https://source.boringavatars.com/marble/100/${txid}?square=true?colors=264653,2a9d8f,e9c46a,f4a261,e76f51`;

export const formatTime = (time: number): string => {
  const minutes: number = Math.floor(time / 60) % 60;
  const seconds: number = Math.floor(time % 60);
  const hours: number = Math.floor(time / 3600);

  const formattedSeconds: string = `${seconds < 10 ? "0" : ""}${seconds}`;

  if (hours > 0) {
    return `${hours}:${minutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
};

export const accountFromAddress = async (
  address: string | undefined
): Promise<ArAccount | undefined> => {
  if (!address) {
    return;
  }
  const userAccount = await getAccount(address);

  return userAccount;
};

interface AbbreviateAddressOptions {
  startChars?: number;
  endChars?: number;
  noOfEllipsis?: number;
}

interface AbbreviateAddress {
  address: string | undefined;
  options?: AbbreviateAddressOptions;
}

export const abbreviateAddress = ({
  address,
  options = {},
}: AbbreviateAddress) => {
  const { startChars = 5, endChars = 4, noOfEllipsis = 2 } = options;

  const dot = ".";
  const firstFive = address?.substring(0, startChars);
  const lastFour = address?.substring(address.length - endChars);
  return `${firstFive}${dot.repeat(noOfEllipsis)}${lastFour}`;
};
