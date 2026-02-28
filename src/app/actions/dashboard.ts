// src/app/actions/dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { decrypt } from "@/lib/session";

export async function getDashboardMetrics() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const sales = await prisma.sales.findMany({
    where: { idUser: userId },
    include: { product: true }
  });

  const cashflows = await prisma.cashFlow.findMany({
    where: { idUser: userId }
  });

  const products = await prisma.product.findMany({
    where: { idUser: userId }
  });

  // LOGIKA GRAFIK: Kelompokkan Pendapatan per Bulan
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const chartData = months.map((month, index) => {
    const total = sales
      .filter(s => new Date(s.created_at).getMonth() === index)
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
    return { name: month, pendapatan: total };
  });

  const totalPendapatan = sales.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalHPP = sales.reduce((acc, curr) => acc + (curr.amount * (curr.product?.hpp || 0)), 0);
  const labaKotor = totalPendapatan - totalHPP;
  const totalPengeluaran = cashflows.filter(cf => cf.tipe === "Pengeluaran").reduce((acc, curr) => acc + curr.nominal, 0);
  const labaBersih = labaKotor - totalPengeluaran;
  const totalStok = products.reduce((acc, curr) => acc + curr.stok, 0);
  const uniqueCustomers = new Set(sales.map(s => s.customerName)).size;
  const clv = uniqueCustomers > 0 ? totalPendapatan / uniqueCustomers : 0;

  return {
    chartData,
    labaKotor,
    labaBersih,
    totalPendapatan,
    totalStok,
    clv,
    totalSales: sales.length,
  };
}

export async function resetDataAction() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);
    const userId = session?.userId as string;
    if (!userId) throw new Error("Sesi tidak valid.");

    await prisma.$transaction([
      prisma.sales.deleteMany({ where: { idUser: userId } }),
      prisma.cashFlow.deleteMany({ where: { idUser: userId } }),
      prisma.product.deleteMany({ where: { idUser: userId } }),
    ]);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Reset Data Error:", error);
    return { success: false, message: error.message };
  }
}