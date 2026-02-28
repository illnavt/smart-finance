// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-jangan-dipakai-di-prod";
const encodedKey = new TextEncoder().encode(secretKey);

// Enkripsi payload menjadi JWT
export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Sesi berlaku selama 7 hari
    .sign(encodedKey);
}

// Dekripsi JWT untuk membaca isinya
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null; // Jika token kedaluwarsa atau tidak valid
  }
}

// Fungsi untuk membuat session saat user berhasil login
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Hari
  const session = await encrypt({ userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true, // Mencegah akses dari JavaScript (mencegah XSS)
    secure: process.env.NODE_ENV === "production", // Wajib HTTPS di mode Production
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}