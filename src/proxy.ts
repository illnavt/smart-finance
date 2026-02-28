// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

// Daftar rute yang butuh login
const protectedRoutes = ["/dashboard"];
// Daftar rute untuk tamu
const publicRoutes = ["/auth"];

// PERUBAHAN DI SINI: Nama fungsi diubah menjadi 'proxy'
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Ambil token dari cookie
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // Jika ke rute terlindungi (dashboard) tapi tidak ada sesi valid -> lempar ke login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth", req.nextUrl));
  }

  // Jika ke rute login tapi sudah punya sesi -> lempar ke dashboard
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Jangan jalankan proxy di file statis atau API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};