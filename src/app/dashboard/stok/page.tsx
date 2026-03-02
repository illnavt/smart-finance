import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import StokClient from "./StokClient";

export default async function StokPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const userProfile = await prisma.profile.findFirst({
    where: { idUser: userId },
    select: { idDepartemen: true },
  });

  const products = await prisma.product.findMany({
    where: { 
      idUser: userId, 
      idDepartemen: userProfile?.idDepartemen 
    },
    orderBy: { created_at: "desc" },
  });

  return <StokClient initialProducts={products} />;
}