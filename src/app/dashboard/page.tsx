// src/app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import UploadZone from "@/components/dashboard/UploadZone"; // Kita pindahkan UI upload ke komponen terpisah agar rapi
import DashboardMetrics from "@/components/dashboard/DashboardMetrics"; // Komponen berisi 11 kartu metrik

export default async function DashboardPage() {
  // 1. Ambil Sesi User
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  // 2. Cek keberadaan data di database
  const hasData = await prisma.product.findFirst({
    where: { idUser: userId }
  });

  // 3. LOGIKA TAMPILAN
  if (!hasData) {
    // TAMPILAN SEBELUM UPLOAD (Hanya Area Upload & Tombol Logout)
    return <UploadZone />;
  }

  // TAMPILAN SETELAH UPLOAD (Dashboard Utama 11 KPI)
  return <DashboardMetrics userId={userId} />;
}