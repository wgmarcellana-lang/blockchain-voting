import { Contract, ContractTransactionResponse, ethers } from "ethers";
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

export async function waitForTransactionWithGasLog(
  label: string,
  tx: ContractTransactionResponse,
  balanceBefore?: bigint
) {
  const signer = getServerSigner();
  const provider = signer.provider!;
  const startingBalance = balanceBefore ?? await provider.getBalance(signer.address);
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error(`${label} transaction was submitted but no receipt was returned`);
  }

  const gasUsed = receipt.gasUsed;
  const gasPrice = receipt.gasPrice;
  const gasFee = gasUsed * gasPrice;
  const balanceAfter = await provider.getBalance(signer.address);
  const balanceDeducted = startingBalance - balanceAfter;

  console.log(`\n=== ${label} Gas Fee Deduction ===`);
  console.log("Tx hash:", tx.hash);
  console.log("Signer:", signer.address);
  console.log("Block:", receipt.blockNumber);
  console.log("Gas used:", gasUsed.toString());
  console.log("Gas price:", `${gasPrice.toString()} wei`);
  console.log("Gas fee:", `${ethers.formatEther(gasFee)} ETH`);
  console.log("Balance before:", `${ethers.formatEther(startingBalance)} ETH`);
  console.log("Balance after:", `${ethers.formatEther(balanceAfter)} ETH`);
  console.log("Deducted:", `${ethers.formatEther(balanceDeducted)} ETH`);

  return {
    receipt,
    gasUsed,
    gasPrice,
    gasFee,
    balanceBefore: startingBalance,
    balanceAfter,
    balanceDeducted,
  };
}
