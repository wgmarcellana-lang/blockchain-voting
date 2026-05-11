import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar";
import AdminLogin from "@/components/admin/AdminLogin";
import AppIcon, { AppIconName } from "@/components/AppIcon";
import { PendingRegistration } from "@/types";

type Tab = "pending" | "students" | "positions" | "candidates" | "election" | "results";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      await axios.post("/api/auth/admin-login", { username, password });
      setAuthed(true);
    } catch {
      setLoginError("Invalid username or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.post("/api/auth/admin-logout");
    setAuthed(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/admin-status");
        setAuthed(Boolean(data.data.authenticated));
      } catch {
        setAuthed(false);
      }
    };

    checkAuth();
  }, []);

  if (authed === null) {
    return (
      <>
        <Head><title>Admin Login - VoteChain</title></Head>
        <Navbar />
        <main className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-4">
          <div className="card p-8 text-center text-gray-500 text-sm">Checking admin session...</div>
        </main>
      </>
    );
  }

  if (!authed) {
    return (
      <AdminLogin
        username={username}
        password={password}
        loginError={loginError}
        loginLoading={loginLoading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const tabs: { id: Tab; label: string; icon: AppIconName }[] = [
    { id: "pending", label: "Pending", icon: "audit" },
    { id: "students", label: "Students", icon: "graduation" },
    { id: "positions", label: "Positions", icon: "audit" },
    { id: "candidates", label: "Candidates", icon: "boy" },
    { id: "election", label: "Election", icon: "ballot" },
    { id: "results", label: "Results", icon: "chart" },
  ];

  return (
    <>
      <Head><title>Admin Panel - VoteChain</title></Head>
      <Navbar />
      <main className="min-h-screen bg-[#F7F8FB]">
        <div className="bg-au-blue-dark border-b-4 border-au-gold px-6 py-4">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-blue-300 text-xs">Server-signed blockchain election control</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white/10 rounded-lg px-3 py-1.5 text-xs text-au-gold font-semibold">
                Backend signer active
              </span>
              <button onClick={onLogout} className="text-blue-300 hover:text-white text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-au-blue text-white shadow" : "text-gray-500 hover:text-au-blue hover:bg-gray-50"
                }`}
              >
                <AppIcon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "pending" && <PendingTab />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "positions" && <PositionsTab />}
          {activeTab === "candidates" && <CandidatesTab />}
          {activeTab === "election" && <ElectionTab />}
          {activeTab === "results" && <ResultsTab />}
        </div>
      </main>
    </>
  );
}

function PendingTab() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [notice, setNotice] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/pending?status=${filter}`);
      setRegistrations(data.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleApprove = async (registration: PendingRegistration) => {
    setActionLoading(registration.id);
    setNotice("");
    try {
      await axios.post("/api/admin/approve", { registrationId: registration.id });
      setNotice(`Approved ${registration.student.name}. The voter is now authorized on-chain.`);
      await fetchRegistrations();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to approve registration.";
      alert(message || "Failed to approve registration.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (registration: PendingRegistration) => {
    const confirmed = window.confirm(
      `Reject ${registration.student.name}'s registration?\n\nStudent ID: ${registration.student.studentId}\n\nThey will not be able to vote with this registration.`
    );
    if (!confirmed) return;

    setActionLoading(registration.id);
    try {
      await axios.post("/api/admin/reject", { registrationId: registration.id });
      await fetchRegistrations();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReset = async (registration: PendingRegistration) => {
    const confirmed = window.confirm(
      `Reset ${registration.student.name}'s registration?\n\nStudent ID: ${registration.student.studentId}\nStatus: ${registration.status}\n\nThis removes the current registration so the student can register again.`
    );
    if (!confirmed) return;

    setActionLoading(registration.id);
    setNotice("");
    try {
      const { data } = await axios.post("/api/admin/reset-registration", { registrationId: registration.id });
      setNotice(`Reset ${data.data.studentName}'s registration.`);
      await fetchRegistrations();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to reset registration.";
      alert(message || "Failed to reset registration.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Registrations</h2>
        <div className="flex gap-1">
          {(["pending", "approved", "rejected"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === state ? "bg-au-gold text-au-blue-dark" : "text-blue-200 hover:bg-white/10"}`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        {notice && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm mb-4">{notice}</div>}
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
        ) : registrations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No {filter} registrations.</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div key={registration.id} className="border border-gray-200 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-au-blue text-sm">{registration.student.name}</p>
                  <p className="text-gray-500 text-xs">ID: {registration.student.studentId}</p>
                  <p className="text-gray-400 text-xs">{registration.student.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {registration.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(registration)} disabled={actionLoading === registration.id} className="btn-primary text-xs py-1.5 px-3">
                        {actionLoading === registration.id ? "..." : "Approve"}
                      </button>
                      <button onClick={() => handleReject(registration)} disabled={actionLoading === registration.id} className="bg-red-50 border border-red-300 text-red-600 text-xs py-1.5 px-3 rounded-lg hover:bg-red-100 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => handleReset(registration)} disabled={actionLoading === registration.id} className="btn-outline text-xs py-1.5 px-3">
                        Reset
                      </button>
                    </>
                  )}
                  {registration.status === "approved" && (
                    <>
                      <span className="badge-approved">Approved</span>
                      <button onClick={() => handleReset(registration)} disabled={actionLoading === registration.id} className="btn-outline text-xs py-1.5 px-3">
                        Reset
                      </button>
                    </>
                  )}
                  {registration.status === "rejected" && (
                    <>
                      <span className="badge-rejected">Rejected</span>
                      <button onClick={() => handleReset(registration)} disabled={actionLoading === registration.id} className="btn-outline text-xs py-1.5 px-3">
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<{ id: number; studentId: string; name: string; email: string; registration: { voterId: string; status: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/students/list");
      setStudents(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async () => {
    setAddError("");
    if (!newId || !newName || !newEmail) {
      setAddError("All fields required.");
      return;
    }

    setAddLoading(true);
    try {
      await axios.post("/api/admin/students/list", { studentId: newId, name: newName, email: newEmail });
      setNewId("");
      setNewName("");
      setNewEmail("");
      await fetchStudents();
    } catch (err: unknown) {
      setAddError(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to add student.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header"><h2 className="font-heading text-xl font-bold">Add Student</h2></div>
        <div className="card-body space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="input-field" placeholder="Student ID" value={newId} onChange={(e) => setNewId(e.target.value)} />
            <input className="input-field" placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="input-field" placeholder="email@adamson.edu.ph" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          {addError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">{addError}</div>}
          <button onClick={handleAdd} disabled={addLoading} className="btn-primary text-sm">
            {addLoading ? "Adding..." : "+ Add Student"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-heading text-xl font-bold">All Students ({students.length})</h2></div>
        <div className="card-body">
          {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2.5 font-medium text-au-blue">{student.name}</td>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">{student.studentId}</td>
                      <td className="py-2.5 text-gray-400 text-xs hidden sm:table-cell">{student.email}</td>
                      <td className="py-2.5">
                        {student.registration ? (
                          <span className={student.registration.status === "approved" ? "badge-approved" : student.registration.status === "rejected" ? "badge-rejected" : "badge-pending"}>
                            {student.registration.status}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">Not registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PositionsTab() {
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/positions");
      setPositions(data.data.positions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;

    setActionLoading(true);
    try {
      await axios.post("/api/admin/positions", { name: newName.trim() });
      setNewName("");
      await fetchPositions();
    } catch (err: unknown) {
      alert(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to add position.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this position? This cannot be undone on-chain.")) return;

    setActionLoading(true);
    try {
      await axios.delete("/api/admin/positions", { data: { id } });
      await fetchPositions();
    } catch (err: unknown) {
      alert(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to remove position.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Positions</h2></div>
      <div className="card-body space-y-4">
        <div className="flex gap-2">
          <input className="input-field" placeholder="Position name (e.g. President)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button onClick={handleAdd} disabled={actionLoading} className="btn-primary text-sm whitespace-nowrap">
            {actionLoading ? "..." : "+ Add"}
          </button>
        </div>
        {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
          <div className="space-y-2">
            {positions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No positions yet.</p>}
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-au-blue text-sm">{position.name}</span>
                <button onClick={() => handleRemove(position.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidatesTab() {
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [candidates, setCandidates] = useState<{ id: string; name: string; positionId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPositionId, setNewPositionId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/positions");
      setPositions(data.data.positions);
      setCandidates(data.data.candidates);
      if (data.data.positions.length > 0 && !newPositionId) {
        setNewPositionId(data.data.positions[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !newPositionId) return;

    setActionLoading(true);
    try {
      await axios.post("/api/admin/candidates", { name: newName.trim(), positionId: newPositionId });
      setNewName("");
      await fetchData();
    } catch (err: unknown) {
      alert(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to add candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this candidate? This cannot be undone on-chain.")) return;

    setActionLoading(true);
    try {
      await axios.delete("/api/admin/candidates", { data: { id } });
      await fetchData();
    } catch (err: unknown) {
      alert(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to remove candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const getPositionName = (id: string) => positions.find((position) => position.id === id)?.name ?? id;

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Candidates</h2></div>
      <div className="card-body space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select className="input-field flex-1" value={newPositionId} onChange={(e) => setNewPositionId(e.target.value)}>
            {positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}
          </select>
          <input className="input-field flex-1" placeholder="Candidate name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button onClick={handleAdd} disabled={actionLoading} className="btn-primary text-sm whitespace-nowrap">
            {actionLoading ? "..." : "+ Add"}
          </button>
        </div>
        {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
          <div className="space-y-1">
            {candidates.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No candidates yet.</p>}
            {candidates.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="font-medium text-au-blue text-sm">{candidate.name}</span>
                  <span className="ml-2 text-gray-400 text-xs">- {getPositionName(candidate.positionId)}</span>
                </div>
                <button onClick={() => handleRemove(candidate.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ElectionTab() {
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get("/api/election/status");
      setVotingOpen(data.data.votingOpen);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: "open" | "close") => {
    setActionLoading(true);
    try {
      await axios.post("/api/admin/election", { action });
      await fetchStatus();
    } catch (err: unknown) {
      alert(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to update election state.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Election Control</h2></div>
      <div className="card-body space-y-6">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
        ) : (
          <>
            <div className={`rounded-xl px-6 py-5 text-center border-2 ${votingOpen ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex justify-center mb-3">
                <span className={`h-5 w-5 rounded-full ${votingOpen ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              <p className="font-heading text-2xl font-bold text-au-blue">
                Voting is {votingOpen ? "OPEN" : "CLOSED"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {votingOpen ? "Approved students can currently cast votes." : "Voting has not started or has already ended."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-au-blue mb-1 text-sm">Open Voting</h3>
                <p className="text-gray-500 text-xs mb-4">Allows approved students with active sessions to start casting votes.</p>
                <button onClick={() => handleAction("open")} disabled={!!votingOpen || actionLoading} className="btn-primary w-full text-sm">
                  {actionLoading ? "Processing..." : "Open Voting"}
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-semibold text-red-700 mb-1 text-sm">Close Voting</h3>
                <p className="text-gray-500 text-xs mb-4">Ends the election. Results will be visible to everyone on the results page.</p>
                <button onClick={() => handleAction("close")} disabled={!votingOpen || actionLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-full text-sm disabled:opacity-50 transition-colors">
                  {actionLoading ? "Processing..." : "Close Voting"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultsTab() {
  const [data, setData] = useState<{ positions: { id: string; name: string }[]; results: { id: string; name: string; positionId: string; voteCount: number }[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: resultData } = await axios.get("/api/results");
        setData(resultData.data);
      } catch {
        setError("Results are only available after voting is closed.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Results</h2></div>
      <div className="card-body">
        {loading && <p className="text-gray-400 text-sm text-center py-6">Loading...</p>}
        {error && <p className="text-gray-400 text-sm text-center py-6">{error}</p>}
        {data && data.positions.map((position) => {
          const candidates = data.results.filter((candidate) => candidate.positionId === position.id);
          const total = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
          const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
          return (
            <div key={position.id} className="mb-6">
              <h3 className="font-semibold text-au-blue text-sm mb-3 border-b border-gray-100 pb-2">{position.name}</h3>
              <div className="space-y-2">
                {sorted.map((candidate, index) => {
                  const pct = total > 0 ? Math.round((candidate.voteCount / total) * 100) : 0;
                  return (
                    <div key={candidate.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${index === 0 && total > 0 ? "text-au-blue font-bold" : "text-gray-600"}`}>
                          {index === 0 && total > 0 && <AppIcon name="trophy" className="mr-1.5 h-4 w-4 align-[-3px] text-au-gold" />}
                          {candidate.name}
                        </span>
                        <span className="text-gray-500">{candidate.voteCount} votes ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${index === 0 && total > 0 ? "bg-au-gold" : "bg-au-blue/30"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
