import { expect } from "chai";
import { ethers } from "hardhat";
import { StudentVoting } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const voter1Id = ethers.id("student-1");
const voter2Id = ethers.id("student-2");
const voter3Id = ethers.id("student-3");

describe("StudentVoting", function () {
  let contract: StudentVoting;
  let admin: HardhatEthersSigner;
  let student1: HardhatEthersSigner;
  let student2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  // Position and candidate IDs set after each addPosition/addCandidate call
  let presidentPositionId: bigint;
  let secretaryPositionId: bigint;
  let candidate1Id: bigint; // president candidate
  let candidate2Id: bigint; // president candidate
  let candidate3Id: bigint; // secretary candidate

  beforeEach(async function () {
    [admin, student1, student2, stranger] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("StudentVoting");
    contract = (await Factory.deploy()) as StudentVoting;
    await contract.waitForDeployment();

    // Add two positions
    let tx = await contract.addPosition("President");
    let receipt = await tx.wait();
    const posEvent1 = receipt?.logs
      .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "PositionAdded");
    presidentPositionId = posEvent1?.args[0];

    tx = await contract.addPosition("Secretary");
    receipt = await tx.wait();
    const posEvent2 = receipt?.logs
      .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "PositionAdded");
    secretaryPositionId = posEvent2?.args[0];

    // Add candidates
    tx = await contract.addCandidate("Alice", presidentPositionId);
    receipt = await tx.wait();
    const candEvent1 = receipt?.logs
      .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "CandidateAdded");
    candidate1Id = candEvent1?.args[0];

    tx = await contract.addCandidate("Bob", presidentPositionId);
    receipt = await tx.wait();
    const candEvent2 = receipt?.logs
      .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "CandidateAdded");
    candidate2Id = candEvent2?.args[0];

    tx = await contract.addCandidate("Carol", secretaryPositionId);
    receipt = await tx.wait();
    const candEvent3 = receipt?.logs
      .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find((e) => e?.name === "CandidateAdded");
    candidate3Id = candEvent3?.args[0];
  });

  // ─────────────────────────────────────────────────────────────
  // Deployment
  // ─────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });

    it("should start with voting closed", async function () {
      expect(await contract.votingOpen()).to.equal(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Whitelist
  // ─────────────────────────────────────────────────────────────

  describe("Authorization", function () {
    it("admin can authorize a voter", async function () {
      await contract.authorizeVoter(voter1Id);
      expect(await contract.authorizedVoters(voter1Id)).to.equal(true);
    });

    it("non-admin cannot authorize a voter", async function () {
      await expect(
        contract.connect(stranger).authorizeVoter(voter1Id)
      ).to.be.revertedWith("Not admin");
    });

    it("cannot authorize the same voter twice", async function () {
      await contract.authorizeVoter(voter1Id);
      await expect(contract.authorizeVoter(voter1Id)).to.be.revertedWith(
        "Already authorized"
      );
    });

    it("admin can revoke a voter", async function () {
      await contract.authorizeVoter(voter1Id);
      await contract.revokeVoter(voter1Id);
      expect(await contract.authorizedVoters(voter1Id)).to.equal(false);
    });

    it("cannot revoke a non-authorized voter", async function () {
      await expect(
        contract.revokeVoter(voter3Id)
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Positions
  // ─────────────────────────────────────────────────────────────

  describe("Positions", function () {
    it("admin can add a position", async function () {
      const positions = await contract.getPositions();
      expect(positions.length).to.equal(2);
    });

    it("non-admin cannot add a position", async function () {
      await expect(
        contract.connect(stranger).addPosition("Treasurer")
      ).to.be.revertedWith("Not admin");
    });

    it("cannot add position with empty name", async function () {
      await expect(contract.addPosition("")).to.be.revertedWith("Name required");
    });

    it("admin can remove a position", async function () {
      await contract.removePosition(presidentPositionId);
      const positions = await contract.getPositions();
      expect(positions.length).to.equal(1);
    });

    it("cannot add or remove positions when voting is open", async function () {
      await contract.openVoting();
      await expect(contract.addPosition("Treasurer")).to.be.revertedWith(
        "Voting is still open"
      );
      await expect(
        contract.removePosition(presidentPositionId)
      ).to.be.revertedWith("Voting is still open");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Candidates
  // ─────────────────────────────────────────────────────────────

  describe("Candidates", function () {
    it("admin can add a candidate", async function () {
      const candidates = await contract.getCandidates();
      expect(candidates.length).to.equal(3);
    });

    it("cannot add candidate to non-existent position", async function () {
      await expect(contract.addCandidate("Dave", 999n)).to.be.revertedWith(
        "Position does not exist"
      );
    });

    it("admin can remove a candidate", async function () {
      await contract.removeCandidate(candidate1Id);
      const candidates = await contract.getCandidates();
      expect(candidates.length).to.equal(2);
    });

    it("cannot add or remove candidates when voting is open", async function () {
      await contract.openVoting();
      await expect(
        contract.addCandidate("Dave", presidentPositionId)
      ).to.be.revertedWith("Voting is still open");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Election Control
  // ─────────────────────────────────────────────────────────────

  describe("Election Control", function () {
    it("admin can open and close voting", async function () {
      await contract.openVoting();
      expect(await contract.votingOpen()).to.equal(true);
      await contract.closeVoting();
      expect(await contract.votingOpen()).to.equal(false);
    });

    it("non-admin cannot open voting", async function () {
      await expect(contract.connect(stranger).openVoting()).to.be.revertedWith(
        "Not admin"
      );
    });

    it("cannot open voting when already open", async function () {
      await contract.openVoting();
      await expect(contract.openVoting()).to.be.revertedWith(
        "Voting is still open"
      );
    });

    it("cannot close voting when already closed", async function () {
      await expect(contract.closeVoting()).to.be.revertedWith(
        "Voting is not open"
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Voting
  // ─────────────────────────────────────────────────────────────

  describe("Voting", function () {
    beforeEach(async function () {
      await contract.authorizeVoter(voter1Id);
      await contract.authorizeVoter(voter2Id);
      await contract.openVoting();
    });

    it("admin can submit a vote for an authorized voter", async function () {
      await contract
        .vote(
          voter1Id,
          [presidentPositionId, secretaryPositionId],
          [candidate1Id, candidate3Id]
        );
      expect(await contract.hasVoted(voter1Id)).to.equal(true);
    });

    it("deducts gas from the signer when a vote is submitted on-chain", async function () {
      const balanceBefore = await ethers.provider.getBalance(admin.address);
      const tx = await contract.vote(
        voter1Id,
        [presidentPositionId, secretaryPositionId],
        [candidate1Id, candidate3Id]
      );
      const receipt = await tx.wait();
      const balanceAfter = await ethers.provider.getBalance(admin.address);

      expect(receipt).to.not.equal(null);
      const gasFee = receipt!.gasUsed * receipt!.gasPrice;

      expect(receipt!.hash).to.equal(tx.hash);
      expect(receipt!.gasUsed).to.be.greaterThan(0n);
      expect(gasFee).to.be.greaterThan(0n);
      expect(balanceBefore - balanceAfter).to.equal(gasFee);
      expect(await contract.hasVoted(voter1Id)).to.equal(true);
    });

    it("rejects non-authorized voters", async function () {
      await expect(
        contract
          .vote(voter3Id, [presidentPositionId], [candidate1Id])
      ).to.be.revertedWith("Not authorized");
    });

    it("non-admin cannot submit votes", async function () {
      await expect(
        contract
          .connect(stranger)
          .vote(voter1Id, [presidentPositionId], [candidate1Id])
      ).to.be.revertedWith("Not admin");
    });

    it("cannot vote twice", async function () {
      await contract
        .vote(voter1Id, [presidentPositionId], [candidate1Id]);
      await expect(
        contract.vote(voter1Id, [presidentPositionId], [candidate1Id])
      ).to.be.revertedWith("Already voted");
    });

    it("cannot vote when voting is closed", async function () {
      await contract.closeVoting();
      await expect(
        contract.vote(voter1Id, [presidentPositionId], [candidate1Id])
      ).to.be.revertedWith("Voting is not open");
    });

    it("rejects mismatched candidate for position", async function () {
      // candidate3Id belongs to secretary, not president
      await expect(
        contract
          .vote(voter1Id, [presidentPositionId], [candidate3Id])
      ).to.be.revertedWith("Invalid candidate for position");
    });

    it("rejects mismatched array lengths", async function () {
      await expect(
        contract
          .vote(voter1Id, [presidentPositionId, secretaryPositionId], [candidate1Id])
      ).to.be.revertedWith("Array length mismatch");
    });

    it("rejects duplicate positions in one ballot", async function () {
      await expect(
        contract
          .vote(voter1Id, [presidentPositionId, presidentPositionId], [candidate1Id, candidate2Id])
      ).to.be.revertedWith("Duplicate position");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Results
  // ─────────────────────────────────────────────────────────────

  describe("Results", function () {
    it("cannot get results while voting is open", async function () {
      await contract.authorizeVoter(voter1Id);
      await contract.openVoting();
      await expect(contract.getResults()).to.be.revertedWith(
        "Voting is still open"
      );
    });

    it("returns correct vote counts after voting closes", async function () {
      await contract.authorizeVoter(voter1Id);
      await contract.authorizeVoter(voter2Id);
      await contract.openVoting();

      await contract.vote(voter1Id, [presidentPositionId], [candidate1Id]);
      await contract.vote(voter2Id, [presidentPositionId], [candidate1Id]);

      await contract.closeVoting();
      const results = await contract.getResults();

      const alice = results.find((c) => c.id === candidate1Id);
      expect(alice?.voteCount).to.equal(2n);

      const bob = results.find((c) => c.id === candidate2Id);
      expect(bob?.voteCount).to.equal(0n);
    });
  });
});
