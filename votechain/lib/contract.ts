import { Contract, ethers } from "ethers";

export const CONTRACT_ABI = [
  "function authorizeVoter(bytes32 voterId) external",
  "function revokeVoter(bytes32 voterId) external",
  "function authorizedVoters(bytes32) external view returns (bool)",
  "function hasVoted(bytes32) external view returns (bool)",
  "function addPosition(string calldata name) external",
  "function removePosition(uint256 positionId) external",
  "function addCandidate(string calldata name, uint256 positionId) external",
  "function removeCandidate(uint256 candidateId) external",
  "function openVoting() external",
  "function closeVoting() external",
  "function getVotingStatus() external view returns (bool)",
  "function vote(bytes32 voterId, uint256[] calldata positionIds, uint256[] calldata candidateIds) external",
  "function getPositions() external view returns (tuple(uint256 id, string name, bool active)[])",
  "function getCandidates() external view returns (tuple(uint256 id, string name, uint256 positionId, uint256 voteCount, bool active)[])",
  "function getResults() external view returns (tuple(uint256 id, string name, uint256 positionId, uint256 voteCount, bool active)[])",
  "function admin() external view returns (address)",
  "function votingOpen() external view returns (bool)",
  "event VoterAuthorized(bytes32 indexed voterId)",
  "event VoteCast(bytes32 indexed voterId)",
  "event VotingOpened()",
  "event VotingClosed()",
  "event PositionAdded(uint256 indexed id, string name)",
  "event CandidateAdded(uint256 indexed id, string name, uint256 positionId)",
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export function getReadOnlyContract(): Contract {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}
