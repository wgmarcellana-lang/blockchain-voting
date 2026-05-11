import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying StudentVoting contract...");
  console.log("Deployer (server signer) address:", deployer.address);

  const StudentVoting = await ethers.getContractFactory("StudentVoting");
  const contract = await StudentVoting.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("StudentVoting deployed to:", address);
  console.log("");
  console.log("Add this to your votechain/.env.local and .env:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`# SERVER_WALLET_PRIVATE_KEY should match the private key for ${deployer.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
