import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AppIcon, { AppIconName } from "@/components/AppIcon";

export default function Home() {
  const builtWith = [
    { name: "Next.js", logo: "/logos/nextjs.svg", className: "h-5 w-5" },
    { name: "Node.js", logo: "/logos/nodejs.svg", className: "h-5 w-auto max-w-[28px]" },
    { name: "Prisma", logo: "/logos/prisma.svg", className: "h-5 w-5" },
    { name: "SQLite", logo: "/logos/sqlite.svg", className: "h-5 w-5" },
    { name: "MetaMask", logo: "/logos/metamask.svg", className: "h-5 w-5" },
    { name: "Solidity", logo: "/logos/solidity.svg", className: "h-5 w-5" },
    { name: "Hardhat", logo: "/logos/hardhat.svg", className: "h-5 w-5" },
  ];

  const features = [
    {
      icon: "padlock" as AppIconName,
      tone: "bg-blue-50",
      title: "Identity-Gated Access",
      desc: "Only verified students with valid school credentials can proceed. No outsiders, no duplicates.",
    },
    {
      icon: "metamask" as AppIconName,
      tone: "bg-yellow-50",
      title: "Wallet-Based Voting",
      desc: "Your MetaMask wallet is linked to your student record. One student, one wallet, one vote.",
    },
    {
      icon: "link" as AppIconName,
      tone: "bg-green-50",
      title: "On-Chain Immutability",
      desc: "Votes are written to the smart contract and cannot be altered after submission.",
    },
    {
      icon: "ban" as AppIconName,
      tone: "bg-red-50",
      title: "Double-Vote Prevention",
      desc: "The contract enforces a strict one-wallet-one-vote rule at the blockchain level.",
    },
    {
      icon: "chart" as AppIconName,
      tone: "bg-blue-50",
      title: "Transparent Results",
      desc: "Anyone can verify vote counts directly from the contract after the election closes.",
    },
    {
      icon: "shield" as AppIconName,
      tone: "bg-gray-100",
      title: "Hybrid Architecture",
      desc: "Student data stays off-chain while wallet approvals and votes are handled on-chain.",
    },
  ];

  const steps = [
    {
      icon: "id" as AppIconName,
      ring: "border-blue-200 bg-blue-50",
      step: "1",
      title: "Verify Identity",
      desc: "Enter your Student ID and school email. Your identity is checked against the ACOMSS registry.",
    },
    {
      icon: "envelope" as AppIconName,
      ring: "border-yellow-200 bg-yellow-50",
      step: "2",
      title: "Submit Registration",
      desc: "Send your verified student details for admin review and approval.",
    },
    {
      icon: "metamask" as AppIconName,
      ring: "border-red-200 bg-red-50",
      step: "3",
      title: "Connect Wallet",
      desc: "Link your MetaMask wallet and sign a message to prove ownership.",
    },
    {
      icon: "ballot" as AppIconName,
      ring: "border-green-200 bg-green-50",
      step: "4",
      title: "Cast Your Vote",
      desc: "Choose your candidates. Your whitelisted wallet submits a transaction to the smart contract.",
    },
    {
      icon: "link" as AppIconName,
      ring: "border-blue-200 bg-blue-50",
      step: "5",
      title: "Vote Confirmed",
      desc: "Your vote is recorded on-chain: permanent, transparent, and publicly auditable.",
    },
  ];

  return (
    <>
      <Head>
        <title>VoteChain — ACOMSS 2026–2027 Elections</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB]">
        {/* Hero */}
        <section className="bg-au-blue-dark relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,184,28,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,71,187,0.35) 0%, transparent 45%), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-24 text-center w-full">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-au-gold/30 shadow-[0_0_0_8px_rgba(255,184,28,0.08)] flex items-center justify-center mx-auto mb-7 overflow-hidden">
              <img
                src="/acomss-logo.jpg"
                alt="ACOMSS logo"
                className="h-full w-full scale-[1.55] object-cover"
              />
            </div>
            <p className="text-au-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-4">
              Adamson Computer Science Society
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">
              VoteChain for <em className="text-au-gold not-italic sm:italic">ACOMSS</em>
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              A secure, transparent, and blockchain-powered voting system for the
              ACOMSS 2026–2027 elections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-gold text-base px-8 py-3.5">
                Register to Vote
              </Link>
              <Link href="/results" className="btn-outline border-white/20 text-white/80 hover:bg-white/5 hover:border-white/50 hover:text-white text-base px-8 py-3.5">
                View Results
              </Link>
            </div>

            <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
              {[
                { label: "Election Type", value: "ACOMSS Officers" },
                { label: "School Year", value: "2026–2027" },
                { label: "Network", value: "Local Chain" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={index < 2 ? "sm:border-r sm:border-white/10" : ""}
                >
                  <p className="text-au-gold font-heading text-3xl font-bold leading-none">{stat.value}</p>
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built with */}
        <section className="border-y border-gray-200 bg-gray-100/70">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Built With
            </span>
            {builtWith.map((item) => (
              <span
                key={item.name}
                className="inline-flex items-center gap-2 text-[#0E1330] text-sm sm:text-base font-semibold"
              >
                <img
                  src={item.logo}
                  alt=""
                  className={`${item.className} max-w-[118px] object-contain`}
                  aria-hidden="true"
                />
                {item.name}
              </span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#0E1330] text-center mb-2">
            How It Works
          </h2>
          <p className="text-gray-400 text-sm text-center mb-12">
            Five steps from student to verified on-chain voter.
          </p>
          <div className="grid gap-8 sm:grid-cols-5">
            {steps.map((s, index) => (
              <div key={s.step} className="relative text-center">
                {index < steps.length - 1 && (
                  <span className="hidden sm:block absolute left-[calc(50%+44px)] right-[calc(-50%+44px)] top-10 h-px bg-gray-200" />
                )}
                <div className={`w-20 h-20 rounded-full border-2 ${s.ring} flex items-center justify-center mx-auto mb-4`}>
                  <AppIcon name={s.icon} className="h-9 w-9 text-au-blue" />
                </div>
                <div className="w-7 h-7 rounded-full bg-au-gold text-au-blue-dark text-xs font-extrabold flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold text-[#0E1330] text-sm mb-2">{s.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#0E1330] text-center mb-2">
            Why VoteChain?
          </h2>
          <p className="text-gray-400 text-sm text-center mb-12">
            Designed to prove that blockchain-based student elections are feasible.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-8 transition duration-200 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-xl ${f.tone} flex items-center justify-center mb-6`}>
                  <AppIcon name={f.icon} className="h-7 w-7 text-au-blue" />
                </div>
                <h3 className="font-bold text-[#0E1330] text-lg mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Election banner */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-au-blue-dark rounded-2xl px-6 sm:px-10 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-au-gold/5 border-[40px] border-au-gold/5" />
            <div className="relative">
              <p className="text-au-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2">
                Current Election
              </p>
              <h2 className="font-heading text-3xl font-semibold text-white mb-3">
                ACOMSS 2026–2027 Elections
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
                <span><strong className="text-white/85">Status:</strong> Local setup ready</span>
                <span><strong className="text-white/85">Chain:</strong> Hardhat 31337</span>
                <span><strong className="text-white/85">Results:</strong> After voting closes</span>
              </div>
            </div>
            <div className="relative md:text-right">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">
                Setup Progress
              </p>
              <p className="font-heading text-5xl font-bold text-au-gold leading-none">Ready</p>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-4 w-full md:w-52">
                <div className="h-full w-full bg-au-gold rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-au-blue mb-4">
            Ready to Vote?
          </h2>
          <p className="text-gray-500 mb-8">
            Make your voice heard in the ACOMSS 2026–2027 elections.
          </p>
          <div className="flex justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5">
              Get Started
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-au-blue-dark text-white/35 text-center text-xs py-6 border-t-2 border-au-gold/20">
          <p><strong className="text-au-gold">VoteChain</strong> — ACOMSS 2026–2027 Elections</p>
          <p className="mt-1 text-white/30">Adamson University · Secured by Blockchain</p>
        </footer>
      </main>
    </>
  );
}
