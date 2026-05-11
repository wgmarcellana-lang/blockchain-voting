import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Student" },
    { href: "/results", label: "Results" },
  ];

  return (
    <nav className="bg-au-blue-dark border-b-[3px] border-au-gold sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 leading-tight">
          <span className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_0_4px_rgba(255,184,28,0.12)]">
            <img
              src="/acomss-logo.jpg"
              alt="ACOMSS logo"
              className="h-full w-full scale-[1.55] object-cover"
            />
          </span>
          <span className="flex flex-col">
            <span className="text-white font-heading font-semibold text-lg tracking-wide">
              VoteChain
            </span>
            <span className="text-au-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
              ACOMSS Elections
            </span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          <span className="chain-badge mr-2">
            <span className="chain-dot" />
            Local Chain
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                router.pathname === link.href
                  ? "bg-au-gold/15 text-au-gold font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold border border-au-gold/40 text-au-gold hover:bg-au-gold hover:text-au-blue-dark transition-colors duration-150"
          >
            Admin
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2 py-1.5 rounded-md text-xs font-medium ${
                router.pathname === link.href
                  ? "bg-au-gold/15 text-au-gold"
                  : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className={`px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              router.pathname === "/admin"
                ? "bg-au-gold/15 text-au-gold"
                : "text-white/70"
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
