// src/app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import UploadZone from "@/components/dashboard/UploadZone";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const hasData = await prisma.product.findFirst({
    where: { idUser: userId },
  });

  if (!hasData) {
    return <UploadZone />;
  }

  return <DashboardMetrics userId={userId} />;
}
