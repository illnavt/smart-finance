"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);

  if (!session?.userId) throw new Error("Unauthorized");

  const userProfile = await prisma.profile.findFirst({
    where: { idUser: session.userId },
    select: { idDepartemen: true },
  });

  if (!userProfile) throw new Error("Departemen tidak ditemukan");

  return {
    userId: session.userId as string,
    deptId: userProfile.idDepartemen,
  };
}

export async function getDashboardMetrics() {
  const { userId, deptId } = await getCurrentUser();

  const salesAgg = await prisma.sales.aggregate({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    _sum: { totalPrice: true },
  });
  const totalPendapatan = salesAgg._sum.totalPrice || 0;

  const sales = await prisma.sales.findMany({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    select: {
      amount: true,
      product: { select: { hpp: true } },
    },
  });

  let totalHpp = 0;
  for (const s of sales) {
    totalHpp += (s.product?.hpp || 0) * (s.amount || 0);
  }

  const labaKotor = totalPendapatan - totalHpp;

  const pengeluaranAgg = await prisma.cashFlow.aggregate({
    where: { idUser: userId, idDepartemen: deptId, tipe: "Pengeluaran" },
    _sum: { nominal: true },
  });
  const totalPengeluaran = pengeluaranAgg._sum.nominal || 0;

  const labaBersih = labaKotor - totalPengeluaran;

  const totalKerugian = labaBersih < 0 ? Math.abs(labaBersih) : 0;

  const stokAgg = await prisma.product.aggregate({
    where: { idUser: userId, idDepartemen: deptId },
    _sum: { stok: true },
  });
  const totalStok = stokAgg._sum.stok || 0;

  const customerCount = await prisma.sales.groupBy({
    by: ["customerName"],
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
  });
  const clv = customerCount.length
    ? Math.round(totalPendapatan / customerCount.length)
    : 0;

  return {
    totalPendapatan,
    labaKotor,
    labaBersih,
    totalKerugian,
    totalStok,
    clv,
  };
}

export async function getAvailableYears() {
  const { userId, deptId } = await getCurrentUser();

  const sales = await prisma.sales.findMany({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    select: { created_at: true },
    orderBy: { created_at: "desc" },
  });

  const years = new Set<number>();
  sales.forEach((s) => {
    const y = new Date(s.created_at).getFullYear();
    if (!isNaN(y)) years.add(y);
  });

  return Array.from(years).sort((a, b) => b - a);
}

export async function getRevenueChart(range: string) {
  const { userId, deptId } = await getCurrentUser();

  const allSales = await prisma.sales.findMany({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    select: {
      created_at: true,
      totalPrice: true,
    },
    orderBy: { created_at: "asc" },
  });

  if (!allSales.length) return [];

  const latestDate = new Date(allSales[allSales.length - 1].created_at);
  const now = new Date();
  if (range === "bulan") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const grouped: Record<number, number> = {};

    for (const s of allSales) {
      const d = new Date(s.created_at);
      if (d < start) continue;

      const day = d.getDate();
      grouped[day] = (grouped[day] || 0) + (s.totalPrice || 0);
    }

    const result: { date: string; total: number }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      if (grouped[i] && grouped[i] > 0) {
        result.push({ date: String(i), total: grouped[i] });
      }
    }
    return result;
  }

  if (range === "3bulan") {
    const end = new Date(latestDate);
    const start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
    const grouped: Record<string, number> = {};

    for (const s of allSales) {
      const d = new Date(s.created_at);
      if (d < start || d > end) continue;

      const key = d.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      grouped[key] = (grouped[key] || 0) + (s.totalPrice || 0);
    }

    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .filter((item) => item.total > 0);
  }

  const isYear = /^\d{4}$/.test(range);

  if (isYear) {
    const targetYear = parseInt(range);
    const grouped: Record<number, number> = {};

    for (const s of allSales) {
      const d = new Date(s.created_at);
      if (d.getFullYear() !== targetYear) continue;

      const month = d.getMonth();
      grouped[month] = (grouped[month] || 0) + (s.totalPrice || 0);
    }

    const result: { date: string; total: number }[] = [];
    for (let m = 0; m <= 11; m++) {
      if (grouped[m] && grouped[m] > 0) {
        const label = new Date(targetYear, m, 1).toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });
        result.push({ date: label, total: grouped[m] });
      }
    }
    return result;
  }

  const grouped: Record<string, number> = {};

  for (const s of allSales) {
    const d = new Date(s.created_at);
    const key = d.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
    grouped[key] = (grouped[key] || 0) + (s.totalPrice || 0);
  }

  return Object.entries(grouped)
    .map(([date, total]) => ({ date, total }))
    .filter((item) => item.total > 0);
}

export async function resetDataAction() {
  const { userId, deptId } = await getCurrentUser();

  await prisma.$transaction([
    prisma.sales.deleteMany({
      where: { idUser: userId, idDepartemen: deptId },
    }),
    prisma.cashFlow.deleteMany({
      where: { idUser: userId, idDepartemen: deptId },
    }),
    prisma.product.deleteMany({
      where: { idUser: userId, idDepartemen: deptId },
    }),
  ]);

  revalidatePath("/dashboard");

  return { success: true };
}

export async function createTransactionAction(data: {
  customerName: string;
  productId: string;
  amount: number;
}) {
  const { userId, deptId } = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) throw new Error("Produk tidak ditemukan");
  if (product.stok < data.amount)
    throw new Error("Stok barang tidak mencukupi!");

  const totalPrice = (product.price || 0) * data.amount;

  await prisma.$transaction([
    prisma.sales.create({
      data: {
        idUser: userId,
        idDepartemen: deptId,
        idProduct: data.productId,
        customerName: data.customerName || "Pelanggan Umum",
        amount: data.amount,
        totalPrice: totalPrice,
        status: "Berhasil",
        created_at: new Date(),
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { stok: { decrement: data.amount } },
    }),
  ]);

  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function deleteTransactionAction(
  transactionId: string,
  productId: string,
  amount: number,
) {
  const { userId, deptId } = await getCurrentUser();

  await prisma.$transaction([
    prisma.sales.delete({
      where: { id: transactionId, idUser: userId, idDepartemen: deptId },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stok: { increment: amount } },
    }),
  ]);

  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function updateTransactionAction(
  transactionId: string,
  newData: { customerName: string; productId: string; amount: number },
  oldData: { productId: string; amount: number },
) {
  const { userId, deptId } = await getCurrentUser();

  const newProduct = await prisma.product.findUnique({
    where: { id: newData.productId },
  });
  if (!newProduct) throw new Error("Produk tidak ditemukan");

  const queries: any[] = [];

  if (newData.productId !== oldData.productId) {
    if (newProduct.stok < newData.amount)
      throw new Error("Stok barang baru tidak mencukupi!");

    queries.push(
      prisma.product.update({
        where: { id: oldData.productId },
        data: { stok: { increment: oldData.amount } },
      }),
    );
    queries.push(
      prisma.product.update({
        where: { id: newData.productId },
        data: { stok: { decrement: newData.amount } },
      }),
    );
  } else if (newData.amount !== oldData.amount) {
    const selisih = newData.amount - oldData.amount;
    if (selisih > 0 && newProduct.stok < selisih)
      throw new Error("Sisa stok tidak mencukupi untuk tambahan ini!");

    queries.push(
      prisma.product.update({
        where: { id: newData.productId },
        data: { stok: { decrement: selisih } },
      }),
    );
  }

  const totalPrice = (newProduct.price || 0) * newData.amount;

  queries.push(
    prisma.sales.update({
      where: { id: transactionId, idUser: userId, idDepartemen: deptId },
      data: {
        customerName: newData.customerName || "Pelanggan Umum",
        idProduct: newData.productId,
        amount: newData.amount,
        totalPrice: totalPrice,
      },
    }),
  );

  await prisma.$transaction(queries);
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function bulkDeleteTransactionAction(
  items: { id: string; productId: string; amount: number }[],
) {
  const { userId, deptId } = await getCurrentUser();
  const queries: any[] = [];

  for (const item of items) {
    queries.push(
      prisma.sales.delete({
        where: { id: item.id, idUser: userId, idDepartemen: deptId },
      }),
    );
    queries.push(
      prisma.product.update({
        where: { id: item.productId },
        data: { stok: { increment: item.amount } },
      }),
    );
  }

  await prisma.$transaction(queries);
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function createProductAction(data: {
  name: string;
  stok: number;
  hpp: number;
  price: number;
}) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.create({
    data: {
      idUser: userId,
      idDepartemen: deptId,
      name: data.name,
      stok: data.stok,
      hpp: data.hpp,
      price: data.price,
    },
  });
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function updateProductAction(
  id: string,
  data: { name: string; stok: number; hpp: number; price: number },
) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: {
      name: data.name,
      stok: data.stok,
      hpp: data.hpp,
      price: data.price,
    },
  });
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.delete({
    where: { id, idUser: userId, idDepartemen: deptId },
  });
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function bulkDeleteProductAction(ids: string[]) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.deleteMany({
    where: { id: { in: ids }, idUser: userId, idDepartemen: deptId },
  });
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function addStockAction(id: string, amountToAdd: number) {
  const { userId, deptId } = await getCurrentUser();

  await prisma.product.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: { stok: { increment: amountToAdd } },
  });

  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function createCashFlowAction(data: {
  tipe: string;
  kategori: string;
  nominal: number;
  keterangan: string;
  tanggal: string;
}) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.cashFlow.create({
    data: {
      idUser: userId,
      idDepartemen: deptId,
      tipe: data.tipe,
      kategori: data.kategori,
      nominal: data.nominal,
      keterangan: data.keterangan || "-",
      tanggal: new Date(data.tanggal),
    },
  });
  revalidatePath("/dashboard/laporan");
  return { success: true };
}

export async function updateCashFlowAction(
  id: string,
  data: {
    tipe: string;
    kategori: string;
    nominal: number;
    keterangan: string;
    tanggal: string;
  },
) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.cashFlow.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: {
      tipe: data.tipe,
      kategori: data.kategori,
      nominal: data.nominal,
      keterangan: data.keterangan,
      tanggal: new Date(data.tanggal),
    },
  });
  revalidatePath("/dashboard/laporan");
  return { success: true };
}

export async function deleteCashFlowAction(id: string) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.cashFlow.delete({
    where: { id, idUser: userId, idDepartemen: deptId },
  });
  revalidatePath("/dashboard/laporan");
  return { success: true };
}

export async function bulkDeleteCashFlowAction(ids: string[]) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.cashFlow.deleteMany({
    where: { id: { in: ids }, idUser: userId, idDepartemen: deptId },
  });
  revalidatePath("/dashboard/laporan");
  return { success: true };
}

export async function getAIPredictionAction(yearsAhead: number) {
  const { userId, deptId } = await getCurrentUser();

  const sales = await prisma.sales.findMany({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    select: { created_at: true, totalPrice: true },
    orderBy: { created_at: "asc" },
  });

  const cashFlows = await prisma.cashFlow.findMany({
    where: { idUser: userId, idDepartemen: deptId, tipe: "Pengeluaran" },
    select: { tanggal: true, nominal: true },
    orderBy: { tanggal: "asc" },
  });

  const yearlyData: Record<number, { revenue: number; expense: number }> = {};

  sales.forEach((s) => {
    const y = new Date(s.created_at).getFullYear();
    if (!yearlyData[y]) yearlyData[y] = { revenue: 0, expense: 0 };
    yearlyData[y].revenue += s.totalPrice || 0;
  });

  cashFlows.forEach((c) => {
    const y = new Date(c.tanggal).getFullYear();
    if (!yearlyData[y]) yearlyData[y] = { revenue: 0, expense: 0 };
    yearlyData[y].expense += c.nominal || 0;
  });

  const history = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => a - b)
    .map((y) => ({
      year: y,
      actualRevenue: yearlyData[y].revenue,
      actualExpense: yearlyData[y].expense,
      predictedRevenue: null as number | null,
      predictedExpense: null as number | null,
    }));

  if (history.length === 0) {
    history.push({
      year: new Date().getFullYear(),
      actualRevenue: 0,
      actualExpense: 0,
      predictedRevenue: null,
      predictedExpense: null,
    });
  }

  let revGrowth = 0.15;
  let expGrowth = 0.08;

  if (history.length > 1) {
    const first = history[0];
    const last = history[history.length - 1];
    const yearDiff = last.year - first.year;

    if (first.actualRevenue > 0 && yearDiff > 0) {
      revGrowth =
        Math.pow(last.actualRevenue / first.actualRevenue, 1 / yearDiff) - 1;
    }
    if (first.actualExpense > 0 && yearDiff > 0) {
      expGrowth =
        Math.pow(last.actualExpense / first.actualExpense, 1 / yearDiff) - 1;
    }
  }

  revGrowth = Math.max(-0.1, Math.min(revGrowth, 0.4));
  expGrowth = Math.max(0.02, Math.min(expGrowth, 0.2));

  const lastData = history[history.length - 1];
  let currentRev = lastData.actualRevenue || 10000000;
  let currentExp = lastData.actualExpense || 5000000;

  lastData.predictedRevenue = lastData.actualRevenue;
  lastData.predictedExpense = lastData.actualExpense;

  const predictions = [];
  for (let i = 1; i <= yearsAhead; i++) {
    const noiseR = 1 + (Math.random() * 0.06 - 0.03);
    const noiseE = 1 + (Math.random() * 0.04 - 0.02);

    currentRev = currentRev * (1 + revGrowth) * noiseR;
    currentExp = currentExp * (1 + expGrowth) * noiseE;

    predictions.push({
      year: lastData.year + i,
      actualRevenue: null,
      actualExpense: null,
      predictedRevenue: Math.round(currentRev),
      predictedExpense: Math.round(currentExp),
    });
  }

  return {
    chartData: [...history, ...predictions],
    metrics: {
      cagr: (revGrowth * 100).toFixed(1),
      projectedRevenue: currentRev,
      projectedProfit: currentRev - currentExp,
    },
  };
}

export async function getRealAISuggestions(metrics: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tidak ditemukan di file .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Kamu adalah AI Konsultan Keuangan dan Bisnis tingkat atas.
      Berikut adalah metrik bisnis klien saat ini:
      - Laba Kotor: Rp ${metrics.labaKotor}
      - Laba Bersih: Rp ${metrics.labaBersih}
      - Total Pendapatan: Rp ${metrics.totalPendapatan}
      - Total Kerugian: Rp ${metrics.totalKerugian}
      - Sisa Stok Barang: ${metrics.totalStok} pcs
      - Customer Lifetime Value (CLV): Rp ${metrics.clv}

      Berikan tepat 3 saran strategis. Balas HANYA dengan format array JSON:
      ["saran 1", "saran 2", "saran 3"]
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI membalas dengan format yang salah.");
    }
  } catch (error) {
    return [
      "Sistem AI Gemini sedang mengalami masalah (exceed limit atau error API). Silakan coba lagi nanti.",
      "Pertahankan stabilitas arus kas Anda bulan ini.",
      "Lakukan audit pada pengeluaran operasional terbesar.",
    ];
  }
}

export async function getRealAIAnalysis(metrics: any, years: number) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tidak ditemukan di file .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Kamu adalah AI Konsultan Bisnis dan Ahli Strategi Perusahaan.
      Sistem statistik kami baru saja memproyeksikan data bisnis klien untuk ${years} tahun ke depan dengan hasil berikut:
      - Pertumbuhan Rata-rata Tahunan (CAGR): ${metrics.cagr}%
      - Proyeksi Pendapatan di Tahun ke-${years}: Rp ${metrics.projectedRevenue}
      - Proyeksi Laba Bersih di Tahun ke-${years}: Rp ${metrics.projectedProfit}

      Tugasmu:
      Berikan analisis mendalam namun sangat ringkas berdasarkan angka proyeksi di atas.
      
      ATURAN WAJIB: Balas HANYA dengan format objek JSON murni seperti ini (tanpa markdown blok seperti \`\`\`json):
      {
        "summary": "Kesimpulan eksekutif yang tajam mengenai tren ini (maksimal 3 kalimat)...",
        "opportunity": "Satu rekomendasi peluang strategis yang harus dieksekusi (maksimal 2 kalimat)...",
        "risk": "Satu mitigasi risiko utama yang harus diwaspadai (maksimal 2 kalimat)..."
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Format JSON Analitik tidak valid.");
    }
  } catch (error) {
    return {
      summary:
        "Sistem AI Gemini sedang mengalami masalah (exceed limit atau error API). Silakan coba lagi nanti. Berdasarkan data historis, sistem memproyeksikan pertumbuhan sebesar " +
        metrics.cagr +
        "% selama " +
        years +
        " tahun ke depan.",
      opportunity:
        "Fokus pada stabilisasi operasional dan perluasan pangsa pasar secara bertahap.",
      risk: "Pantau fluktuasi biaya operasional yang dapat menekan margin laba di masa depan.",
    };
  }
}
