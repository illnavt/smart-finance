import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import TransaksiClient from "./TransaksiClient";

export default async function TransaksiPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const userProfile = await prisma.profile.findFirst({
    where: { idUser: userId },
    select: { idDepartemen: true },
  });

  const transactions = await prisma.sales.findMany({
    where: {
      idUser: userId,
      idDepartemen: userProfile?.idDepartemen,
    },
    include: { product: true },
    orderBy: { created_at: "desc" },
  });

  const products = await prisma.product.findMany({
    where: {
      idUser: userId,
      idDepartemen: userProfile?.idDepartemen,
      stok: { gt: 0 },
    },
    select: { id: true, name: true, price: true, stok: true },
  });

  const serializedTransactions = transactions.map((t) => ({
    ...t,
    created_at: t.created_at.toISOString(),
  }));

  return (
    <TransaksiClient
      initialTransactions={serializedTransactions}
      products={products}
    />
  );
}
