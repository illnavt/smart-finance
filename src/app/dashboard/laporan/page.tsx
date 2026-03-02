import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import LaporanClient from "./LaporanClient";

export default async function LaporanPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const userProfile = await prisma.profile.findFirst({
    where: { idUser: userId },
    select: { idDepartemen: true },
  });

  const cashFlows = await prisma.cashFlow.findMany({
    where: { 
      idUser: userId, 
      idDepartemen: userProfile?.idDepartemen 
    },
    orderBy: { tanggal: "desc" },
  });

  // Serialisasi data tanggal ke ISO String (hindari error Hydration Next.js)
  const serializedData = cashFlows.map((item) => ({
    ...item,
    tanggal: item.tanggal.toISOString()
  }));

  return <LaporanClient initialData={serializedData} />;
}