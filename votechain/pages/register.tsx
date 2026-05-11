import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "@/components/Navbar";
import StepBar from "@/components/StepBar";
import AppIcon from "@/components/AppIcon";

const STEPS = [
  { label: "Register", description: "Submit your student details" },
  { label: "Admin Review", description: "Wait for approval" },
  { label: "Sign In", description: "Vote when approved" },
];

type Mode = "register" | "login";

function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [submittedStudent, setSubmittedStudent] = useState<{ name: string; studentId: string; email: string } | null>(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!name.trim() || !studentId.trim() || !email.trim()) {
      setError("Please fill in your full name, student ID, and Adamson email.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/students/register", {
        name,
        studentId,
        email,
      });

      setSubmittedStudent(data.data.student);
      setStep(1);
      setTimeout(() => setStep(2), 250);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    setLoginError("");

    if (!loginStudentId.trim() || !loginEmail.trim()) {
      setLoginError("Please enter your student ID and Adamson email.");
      return;
    }

    setLoginLoading(true);
    try {
      await axios.post("/api/auth/student-login", {
        studentId: loginStudentId,
        email: loginEmail,
      });
      router.push("/vote");
    } catch (err: unknown) {
      setLoginError(getApiErrorMessage(err, "Failed to sign in."));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - VoteChain</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-au-blue">Student Access</h1>
            <p className="text-gray-500 mt-2 text-sm">Register first, then sign in again after admin approval to vote.</p>
          </div>

          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm mb-6 max-w-md mx-auto">
            <button
              onClick={() => setMode("register")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "register" ? "bg-au-blue text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "login" ? "bg-au-blue text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Student Login
            </button>
          </div>

          {mode === "register" ? (
            <>
              <StepBar steps={STEPS} currentStep={step} />

              <div className="card mt-6 max-w-lg mx-auto">
                <div className="card-header">
                  <h2 className="font-heading text-xl font-bold">{STEPS[step]?.label}</h2>
                  <p className="text-blue-200 text-xs mt-0.5">{STEPS[step]?.description}</p>
                </div>
                <div className="card-body">
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. Juan Dela Cruz"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Student ID
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. 202215505"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          Adamson Email
                        </label>
                        <input
                          type="email"
                          className="input-field"
                          placeholder="youremail@adamson.edu.ph"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                        <p className="text-xs text-gray-400 mt-1">Your email must end with @adamson.edu.ph.</p>
                      </div>

                      {error && <ErrorBox message={error} />}

                      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
                        {loading ? "Submitting..." : "Submit Registration"}
                      </button>
                    </div>
                  )}

                  {step >= 1 && submittedStudent && (
                    <div className="text-center space-y-5 py-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-au-blue">Registration Submitted!</h3>
                        <p className="text-gray-500 text-sm mt-2">
                          Your registration is now pending admin review. Once approved, return here, switch to Student Login, and sign in to access the ballot.
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left text-xs text-gray-500 space-y-1">
                        <p><span className="font-semibold">Name:</span> {submittedStudent.name}</p>
                        <p><span className="font-semibold">Student ID:</span> {submittedStudent.studentId}</p>
                        <p><span className="font-semibold">Email:</span> {submittedStudent.email}</p>
                        <p><span className="font-semibold">Status:</span> <span className="badge-pending">Pending</span></p>
                      </div>
                      <button
                        onClick={() => setMode("login")}
                        className="btn-primary"
                      >
                        Go to Student Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card max-w-lg mx-auto">
              <div className="card-header">
                <h2 className="font-heading text-xl font-bold">Student Login</h2>
                <p className="text-blue-200 text-xs mt-0.5">Use this after your registration has been approved.</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 202215505"
                    value={loginStudentId}
                    onChange={(e) => setLoginStudentId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Adamson Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="youremail@adamson.edu.ph"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStudentLogin()}
                  />
                </div>


                {loginError && <ErrorBox message={loginError} />}

                <button onClick={handleStudentLogin} disabled={loginLoading} className="btn-gold w-full">
                  {loginLoading ? "Signing In..." : "Sign In and Vote"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
      <AppIcon name="warning" className="mr-2 h-4 w-4 align-[-2px] text-red-600" />
      {message}
    </div>
  );
}
