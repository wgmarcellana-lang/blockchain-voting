import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { formatEther } from "ethers";
import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import BallotReview from "@/components/BallotReview";
import AppIcon, { AppIconName } from "@/components/AppIcon";
import { BallotSelections, CandidateUI, PositionUI } from "@/types";

type VoteStatus =
  | "checking_session"
  | "login"
  | "checking"
  | "not_approved"
  | "already_voted"
  | "voting_closed"
  | "ready"
  | "reviewing"
  | "submitting"
  | "success";

type ChainProof = {
  txHash: string;
  contractAddress: string;
  signerAddress: string;
  blockNumber: number;
  gasUsed: string;
  gasPriceWei: string;
  gasFeeWei: string;
  balanceBeforeWei: string;
  balanceAfterWei: string;
  balanceDeductedWei: string;
};

export default function VotePage() {
  const router = useRouter();
  const [status, setStatus] = useState<VoteStatus>("checking_session");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [positions, setPositions] = useState<PositionUI[]>([]);
  const [candidates, setCandidates] = useState<CandidateUI[]>([]);
  const [selections, setSelections] = useState<BallotSelections>({});
  const [chainProof, setChainProof] = useState<ChainProof | null>(null);
  const [error, setError] = useState("");

  const checkVoteStatus = async () => {
    setStatus("checking");
    setError("");

    try {
      const [{ data: statusData }, { data: ballotData }] = await Promise.all([
        axios.get("/api/vote/status"),
        axios.get("/api/positions"),
      ]);

      const voteStatus = statusData.data;
      setStudentName(voteStatus.student.name);
      setStudentId(voteStatus.student.studentId);

      if (!voteStatus.votingOpen) {
        setStatus("voting_closed");
        return;
      }

      if (!voteStatus.authorized) {
        setStatus("not_approved");
        return;
      }

      if (voteStatus.hasVoted) {
        setStatus("already_voted");
        return;
      }

      setPositions(ballotData.data.positions);
      setCandidates(ballotData.data.candidates);
      setStatus("ready");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setStatus("login");
        return;
      }

      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to load voting status.";
      setError(message || "Failed to load voting status.");
      setStatus("login");
    }
  };

  useEffect(() => {
    checkVoteStatus();
  }, []);

  const handleLogin = async () => {
    setError("");
    try {
      await axios.post("/api/auth/student-login", { studentId, email });
      await checkVoteStatus();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to sign in.";
      setError(message || "Failed to sign in.");
      setStatus("login");
    }
  };

  const handleLogout = async () => {
    await axios.post("/api/auth/student-logout");
    setSelections({});
    setChainProof(null);
    setStudentName("");
    setStudentId("");
    setEmail("");
    setError("");
    setStatus("login");
  };

  const handleSwitchStudent = async () => {
    await handleLogout();
    router.push("/register");
  };

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  };

  const skippedPositions = positions.filter((p) => !selections[p.id]);

  const handleSubmitVote = async () => {
    setStatus("submitting");
    setError("");

    try {
      const { data } = await axios.post("/api/vote/submit", { selections });
      setChainProof(data.data);
      setStatus("success");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Vote submission failed.";
      setError(message || "Vote submission failed.");
      setStatus("reviewing");
    }
  };

  return (
    <>
      <Head>
        <title>Vote - VoteChain</title>
      </Head>
      <Navbar />

      {(status === "reviewing" || status === "submitting") && (
        <BallotReview
          positions={positions}
          candidates={candidates}
          selections={selections}
          onConfirm={handleSubmitVote}
          onBack={() => setStatus("ready")}
          isSubmitting={status === "submitting"}
        />
      )}

      <main className="min-h-screen bg-[#F7F8FB] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-au-blue">Cast Your Vote</h1>
            <p className="text-gray-500 mt-2 text-sm">ACOMSS 2026-2027 Elections</p>
          </div>

          {status === "checking_session" || status === "checking" ? (
            <StatusCard icon="audit" title="Checking voting access..." desc="Verifying your approved session and blockchain status." />
          ) : null}

          {status === "login" && (
            <StatusCard
              icon="shield"
              title="Student Sign In"
              desc="Sign in with your approved student details to access the ballot."
              error={error}
              action={
                <div className="w-full max-w-sm space-y-3 text-left">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="youremail@adamson.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button onClick={handleLogin} className="btn-gold w-full">Sign In to Vote</button>
                </div>
              }
            />
          )}

          {status === "not_approved" && (
            <StatusCard
              icon="padlock"
              title="Voting Access Not Approved"
              desc="Your account is not currently authorized to cast a vote on-chain. Please contact the election admin if this seems incorrect."
              action={
                <div className="flex flex-col gap-3">
                  <a href="/register" className="btn-primary inline-block">Go to Student Access</a>
                  <button onClick={handleSwitchStudent} className="btn-outline">Switch Student</button>
                </div>
              }
              variant="warning"
            />
          )}

          {status === "already_voted" && (
            <StatusCard
              icon="check"
              title="You Have Already Voted"
              desc="Your vote has already been recorded on the blockchain. Thank you for participating."
              action={
                <div className="flex flex-col gap-3">
                  <a href="/results" className="btn-primary inline-block">View Results</a>
                  <button onClick={handleSwitchStudent} className="btn-outline">Switch Student</button>
                </div>
              }
              variant="success"
            />
          )}

          {status === "voting_closed" && (
            <StatusCard
              icon="race"
              title="Voting is Closed"
              desc="The election has ended. Check the results page to see the winners."
              action={<a href="/results" className="btn-primary inline-block">View Results</a>}
            />
          )}

          {status === "success" && (
            <StatusCard
              icon="party"
              title="Vote Submitted Successfully!"
              desc="Your vote has been permanently recorded on the blockchain."
              variant="success"
              action={
                <div className="space-y-3 w-full">
                  {chainProof && <BlockchainProof proof={chainProof} />}
                  <div className="flex flex-col gap-3">
                    <a href="/results" className="btn-primary inline-block">View Results</a>
                    <button onClick={handleLogout} className="btn-outline">Sign Out</button>
                  </div>
                </div>
              }
            />
          )}

          {status === "ready" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500">Signed in as:</span>
                <span className="text-xs font-semibold text-au-blue">{studentName}</span>
                <span className="ml-auto text-xs font-mono text-gray-400">{studentId}</span>
                <button onClick={handleLogout} className="btn-outline text-xs py-1 px-3">Sign Out</button>
              </div>

              {skippedPositions.length > 0 && Object.keys(selections).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-700 text-sm">
                  You&apos;re preparing a partial ballot. No candidate selected for:{" "}
                  <span className="font-semibold">{skippedPositions.map((p) => p.name).join(", ")}</span>
                </div>
              )}

              {positions.map((position) => {
                const positionCandidates = candidates.filter((c) => c.positionId === position.id);
                return (
                  <div key={position.id} className="card">
                    <div className="card-header flex items-center justify-between">
                      <h3 className="font-heading text-lg font-bold">{position.name}</h3>
                      {selections[position.id] ? (
                        <span className="badge-approved text-xs inline-flex items-center gap-1">
                          <AppIcon name="check" className="h-3.5 w-3.5 text-green-700" />
                          Selected
                        </span>
                      ) : (
                        <span className="badge-pending text-xs">Not selected</span>
                      )}
                    </div>
                    <div className="card-body grid gap-3">
                      {positionCandidates.length === 0 ? (
                        <p className="text-gray-400 text-sm">No candidates for this position.</p>
                      ) : (
                        positionCandidates.map((candidate) => (
                          <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            isSelected={selections[position.id] === candidate.id}
                            onSelect={(candidateId) => handleSelect(position.id, candidateId)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                  <AppIcon name="warning" className="mr-2 h-4 w-4 align-[-2px] text-red-600" />
                  {error}
                </div>
              )}

              <div className="sticky bottom-4">
                <button
                  onClick={() => setStatus("reviewing")}
                  disabled={Object.keys(selections).length === 0}
                  className="btn-gold w-full text-base py-4 rounded-xl shadow-lg"
                >
                  {Object.keys(selections).length === positions.length ? "Review Ballot" : "Review Partial Ballot"} ({Object.keys(selections).length}/{positions.length} selected)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function BlockchainProof({ proof }: { proof: ChainProof }) {
  const rows = [
    ["Contract", proof.contractAddress],
    ["Tx Hash", proof.txHash],
    ["Block", String(proof.blockNumber)],
    ["Signer", proof.signerAddress],
    ["Gas Used", proof.gasUsed],
    ["Gas Price", `${proof.gasPriceWei} wei`],
    ["Gas Fee", `${formatEther(proof.gasFeeWei)} ETH`],
    ["Before", `${formatEther(proof.balanceBeforeWei)} ETH`],
    ["After", `${formatEther(proof.balanceAfterWei)} ETH`],
    ["Deducted", `${formatEther(proof.balanceDeductedWei)} ETH`],
  ];

  return (
    <div className="rounded-lg border border-green-200 bg-white text-left shadow-sm">
      <div className="border-b border-green-100 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">Blockchain Receipt</p>
      </div>
      <dl className="divide-y divide-gray-100">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[88px_1fr] gap-3 px-4 py-2 text-xs">
            <dt className="font-semibold text-gray-600">{label}</dt>
            <dd className="break-all font-mono text-gray-500">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  desc,
  action,
  error,
  variant,
}: {
  icon: AppIconName;
  title: string;
  desc: string;
  action?: React.ReactNode;
  error?: string;
  variant?: "success" | "warning" | "default";
}) {
  const bg = variant === "success" ? "bg-green-50 border-green-200" : variant === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200";
  return (
    <div className={`card border ${bg} text-center p-10 space-y-4`}>
      <div className="flex justify-center">
        <AppIcon name={icon} className="h-12 w-12 text-au-blue" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-au-blue">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">{desc}</p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm text-left">
          {error}
        </div>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
