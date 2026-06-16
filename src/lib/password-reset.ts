import { SignJWT, jwtVerify } from "jose";

const RESET_PURPOSE = "password_reset";
const RESET_EXPIRY = "1h";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createPasswordResetToken(email: string) {
  return new SignJWT({ email, purpose: RESET_PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(RESET_EXPIRY)
    .sign(getSecret());
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== RESET_PURPOSE || typeof payload.email !== "string") {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}
