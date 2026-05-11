import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE_NAME = "votechain_voter";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 4;

type VoterSessionPayload = {
  studentId: string;
  voterId: string;
  exp: number;
};

function getSessionSecret() {
  return (
    process.env.VOTER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "votechain-dev-voter-session-secret"
  );
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function parseCookies(cookieHeader: string | undefined) {
  return Object.fromEntries(
    (cookieHeader ?? "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1) return [cookie, ""];
        return [cookie.slice(0, separatorIndex), decodeURIComponent(cookie.slice(separatorIndex + 1))];
      })
  );
}

function serializeCookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function createVoterSessionCookie(studentId: string, voterId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      studentId,
      voterId,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    } satisfies VoterSessionPayload)
  ).toString("base64url");

  return serializeCookie(COOKIE_NAME, `${payload}.${sign(payload)}`, SESSION_MAX_AGE_SECONDS);
}

export function clearVoterSessionCookie() {
  return serializeCookie(COOKIE_NAME, "", 0);
}

export function getVoterSession(req: NextApiRequest): VoterSessionPayload | null {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as VoterSessionPayload;
    if (!data.studentId || !data.voterId || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function requireVoter(req: NextApiRequest, res: NextApiResponse) {
  const session = getVoterSession(req);
  if (session) return session;

  res.status(401).json({ success: false, error: "Voter authentication required" });
  return null;
}
