import { Contract, ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, RPC_URL } from "@/lib/contract";

function getServerWalletPrivateKey() {
  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SERVER_WALLET_PRIVATE_KEY is not configured");
  }
  return privateKey;
}

export function getServerSigner() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(getServerWalletPrivateKey(), provider);
}

export function getServerSignerContract(): Contract {
  const signer = getServerSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
