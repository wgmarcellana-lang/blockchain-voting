import { CandidateUI } from "@/types";
import AppIcon from "@/components/AppIcon";

interface ResultsCardProps {
  positionName: string;
  candidates: CandidateUI[];
}

export default function ResultsCard({ positionName, candidates }: ResultsCardProps) {
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const topVoteCount = sorted[0]?.voteCount ?? 0;
  const leaders = sorted.filter((candidate) => candidate.voteCount === topVoteCount);
  const hasTie = totalVotes > 0 && leaders.length > 1;
  const winner = !hasTie ? sorted[0] : undefined;

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">{positionName}</h3>
        <span className="text-blue-200 text-xs">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
      </div>
      <div className="card-body space-y-3">
        {sorted.map((candidate) => {
          const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
          const isWinner = candidate.id === winner?.id && totalVotes > 0;
          const isTiedLeader = hasTie && candidate.voteCount === topVoteCount;

          return (
            <div key={candidate.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(isWinner || isTiedLeader) && (
                    <AppIcon name="trophy" className="h-4 w-4 text-au-gold" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      isWinner || isTiedLeader ? "text-au-blue" : "text-gray-700"
                    }`}
                  >
                    {candidate.name}
                  </span>
                  {isWinner && (
                    <span className="badge-approved text-xs">Winner</span>
                  )}
                  {isTiedLeader && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Tie
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-au-blue">{pct}%</span>
                  <span className="text-xs text-gray-400 ml-1">({candidate.voteCount})</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    isWinner || isTiedLeader ? "bg-au-gold" : "bg-au-blue-mid/40"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {candidates.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-2">No candidates for this position.</p>
        )}
      </div>
    </div>
  );
}
