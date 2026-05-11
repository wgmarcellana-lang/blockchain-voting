export interface Position {
  id: bigint;
  name: string;
  active: boolean;
}

export interface Candidate {
  id: bigint;
  name: string;
  positionId: bigint;
  voteCount: bigint;
  active: boolean;
}

export interface PositionUI {
  id: string;
  name: string;
}

export interface CandidateUI {
  id: string;
  name: string;
  positionId: string;
  voteCount: number;
}

export type BallotSelections = Record<string, string>;

export interface PendingRegistration {
  id: number;
  studentId: string;
  voterId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string | null;
  student: {
    name: string;
    studentId: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
