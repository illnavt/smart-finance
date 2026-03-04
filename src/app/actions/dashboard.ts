"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ================================
// 🔐 Helper: get current user
// ================================
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

// ================================
// 📊 DASHBOARD METRICS
// ================================
export async function getDashboardMetrics() {
  const { userId, deptId } = await getCurrentUser();

  // 1. Total Pendapatan (Hanya transaksi yang Berhasil)
  const salesAgg = await prisma.sales.aggregate({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    _sum: { totalPrice: true },
  });
  const totalPendapatan = salesAgg._sum.totalPrice || 0;

  // 2. Total HPP (Modal barang yang terjual)
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

  // 3. Laba Kotor = Pendapatan Kotor - Modal Barang
  const labaKotor = totalPendapatan - totalHpp;

 // 4. Hitung Total Pengeluaran dari Arus Kas
  const pengeluaranAgg = await prisma.cashFlow.aggregate({
    where: { idUser: userId, idDepartemen: deptId, tipe: "Pengeluaran" },
    _sum: { nominal: true },
  });
  const totalPengeluaran = pengeluaranAgg._sum.nominal || 0;

  // HAPUS BAGIAN PEMASUKAN TAMBAHAN KARENA MODAL AWAL BUKAN LABA!
  // 5. Laba Bersih = Laba Kotor - Pengeluaran Operasional
  const labaBersih = labaKotor - totalPengeluaran;

  // 6. TOTAL KERUGIAN (Jika Laba Bersih minus)
  const totalKerugian = labaBersih < 0 ? Math.abs(labaBersih) : 0;

  // 7. Hitung Sisa Stok Barang
  const stokAgg = await prisma.product.aggregate({
    where: { idUser: userId, idDepartemen: deptId },
    _sum: { stok: true },
  });
  const totalStok = stokAgg._sum.stok || 0;

  // 8. CLV (Nilai Pelanggan)
  const customerCount = await prisma.sales.groupBy({
    by: ["customerName"],
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
  });
  const clv = customerCount.length
    ? Math.round(totalPendapatan / customerCount.length)
    : 0;

  // Kembalikan semua data ke Frontend
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

  // Gunakan Set untuk mendapatkan tahun unik
  const years = new Set<number>();
  sales.forEach((s) => {
    const y = new Date(s.created_at).getFullYear();
    if (!isNaN(y)) years.add(y);
  });

  // Kembalikan dalam bentuk array [2026, 2025, 2024]
  return Array.from(years).sort((a, b) => b - a);
}

// ================================
// 📈 REVENUE CHART (SMART RANGE)
// ================================
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
  // =====================================
  // 🔹 BULAN INI → per HARI
  // =====================================
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
      // LOGIKA BARU: Hanya masukkan jika nilainya lebih dari 0
      if (grouped[i] && grouped[i] > 0) {
        result.push({ date: String(i), total: grouped[i] });
      }
    }
    return result;
  }

  // =====================================
  // 🔹 3 BULAN TERAKHIR
  // =====================================
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
      .filter((item) => item.total > 0); // LOGIKA BARU
  }

  // =====================================
  // 🔹 JIKA RANGE ADALAH TAHUN SPESIFIK (Misal: "2025")
  // =====================================
  const isYear = /^\d{4}$/.test(range);

  if (isYear) {
    const targetYear = parseInt(range);
    const grouped: Record<number, number> = {};

    for (const s of allSales) {
      const d = new Date(s.created_at);
      if (d.getFullYear() !== targetYear) continue;

      const month = d.getMonth(); // 0 = Jan, 11 = Des
      grouped[month] = (grouped[month] || 0) + (s.totalPrice || 0);
    }

    const result: { date: string; total: number }[] = [];
    // Looping 12 bulan
    for (let m = 0; m <= 11; m++) {
      if (grouped[m] && grouped[m] > 0) {
        // Hanya tampilkan bulan yang ada datanya
        const label = new Date(targetYear, m, 1).toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });
        result.push({ date: label, total: grouped[m] });
      }
    }
    return result;
  }

  // =====================================
  // 🔹 SEMUA DATA (Default)
  // =====================================
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

// ================================
// 🧹 RESET DATA
// ================================
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

  // Cari harga satuan produk dari database
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) throw new Error("Produk tidak ditemukan");
  if (product.stok < data.amount) throw new Error("Stok barang tidak mencukupi!");

  const totalPrice = (product.price || 0) * data.amount;

  // Gunakan Transaction untuk memastikan Data Penjualan masuk & Stok berkurang
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
  amount: number
) {
  const { userId, deptId } = await getCurrentUser();

  // Gunakan Transaction agar jika satu gagal, gagal semua (aman)
  await prisma.$transaction([
    prisma.sales.delete({
      where: { id: transactionId, idUser: userId, idDepartemen: deptId },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stok: { increment: amount } }, // Kembalikan stok yang terpotong
    }),
  ]);

  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function updateTransactionAction(
  transactionId: string,
  newData: { customerName: string; productId: string; amount: number },
  oldData: { productId: string; amount: number }
) {
  const { userId, deptId } = await getCurrentUser();

  const newProduct = await prisma.product.findUnique({ where: { id: newData.productId } });
  if (!newProduct) throw new Error("Produk tidak ditemukan");

  const queries: any[] = [];

  // LOGIKA STOK: Jika produk yang diedit BERBEDA dengan produk sebelumnya
  if (newData.productId !== oldData.productId) {
    if (newProduct.stok < newData.amount) throw new Error("Stok barang baru tidak mencukupi!");
    
    // 1. Kembalikan stok produk lama
    queries.push(prisma.product.update({
      where: { id: oldData.productId },
      data: { stok: { increment: oldData.amount } },
    }));
    // 2. Potong stok produk baru
    queries.push(prisma.product.update({
      where: { id: newData.productId },
      data: { stok: { decrement: newData.amount } },
    }));
  } 
  // LOGIKA STOK: Jika produk SAMA, tapi jumlah (qty) diubah
  else if (newData.amount !== oldData.amount) {
    const selisih = newData.amount - oldData.amount; // Jika positif berarti nambah pesanan, jika negatif ngurangin
    if (selisih > 0 && newProduct.stok < selisih) throw new Error("Sisa stok tidak mencukupi untuk tambahan ini!");
    
    queries.push(prisma.product.update({
      where: { id: newData.productId },
      data: { stok: { decrement: selisih } }, // decrement bisa menerima angka negatif (otomatis jadi increment)
    }));
  }

  const totalPrice = (newProduct.price || 0) * newData.amount;

  // Update Data Transaksi
  queries.push(prisma.sales.update({
    where: { id: transactionId, idUser: userId, idDepartemen: deptId },
    data: {
      customerName: newData.customerName || "Pelanggan Umum",
      idProduct: newData.productId,
      amount: newData.amount,
      totalPrice: totalPrice,
    },
  }));

  await prisma.$transaction(queries);
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

// ================================
// 🗑️ HAPUS MASSAL (BULK DELETE)
// ================================
export async function bulkDeleteTransactionAction(
  items: { id: string; productId: string; amount: number }[]
) {
  const { userId, deptId } = await getCurrentUser();
  const queries: any[] = [];

  for (const item of items) {
    // 1. Hapus transaksi
    queries.push(prisma.sales.delete({
      where: { id: item.id, idUser: userId, idDepartemen: deptId },
    }));
    // 2. Kembalikan stok
    queries.push(prisma.product.update({
      where: { id: item.productId },
      data: { stok: { increment: item.amount } },
    }));
  }

  await prisma.$transaction(queries);
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}




// ##########################################################
// STOK
export async function createProductAction(data: { name: string; stok: number; hpp: number; price: number }) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.create({
    data: {
      idUser: userId,
      idDepartemen: deptId,
      name: data.name,
      stok: data.stok,
      hpp: data.hpp,
      price: data.price,
    }
  });
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function updateProductAction(id: string, data: { name: string; stok: number; hpp: number; price: number }) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.product.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: {
      name: data.name,
      stok: data.stok,
      hpp: data.hpp,
      price: data.price,
    }
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

// ================================
// ⚡ TAMBAH STOK CEPAT (QUICK ADD)
// ================================
export async function addStockAction(id: string, amountToAdd: number) {
  const { userId, deptId } = await getCurrentUser();
  
  await prisma.product.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: { stok: { increment: amountToAdd } },
  });
  
  revalidatePath("/dashboard/stok");
  return { success: true };
}


export async function createCashFlowAction(data: { tipe: string; kategori: string; nominal: number; keterangan: string; tanggal: string }) {
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
    }
  });
  revalidatePath("/dashboard/laporan");
  return { success: true };
}

export async function updateCashFlowAction(id: string, data: { tipe: string; kategori: string; nominal: number; keterangan: string; tanggal: string }) {
  const { userId, deptId } = await getCurrentUser();
  await prisma.cashFlow.update({
    where: { id, idUser: userId, idDepartemen: deptId },
    data: {
      tipe: data.tipe,
      kategori: data.kategori,
      nominal: data.nominal,
      keterangan: data.keterangan,
      tanggal: new Date(data.tanggal),
    }
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

// ================================
// 🤖 PREDIKSI AI (ANALITIK)
// ================================
export async function getAIPredictionAction(yearsAhead: number) {
  const { userId, deptId } = await getCurrentUser();

  // 1. Ambil data transaksi mentah
  const sales = await prisma.sales.findMany({
    where: { idUser: userId, idDepartemen: deptId, status: "Berhasil" },
    select: { created_at: true, totalPrice: true },
    orderBy: { created_at: "asc" }
  });

  const cashFlows = await prisma.cashFlow.findMany({
    where: { idUser: userId, idDepartemen: deptId, tipe: "Pengeluaran" },
    select: { tanggal: true, nominal: true },
    orderBy: { tanggal: "asc" }
  });

  // 2. Kelompokkan berdasarkan Tahun
  const yearlyData: Record<number, { revenue: number; expense: number }> = {};
  
  sales.forEach(s => {
    const y = new Date(s.created_at).getFullYear();
    if (!yearlyData[y]) yearlyData[y] = { revenue: 0, expense: 0 };
    yearlyData[y].revenue += (s.totalPrice || 0);
  });

  cashFlows.forEach(c => {
    const y = new Date(c.tanggal).getFullYear();
    if (!yearlyData[y]) yearlyData[y] = { revenue: 0, expense: 0 };
    yearlyData[y].expense += (c.nominal || 0);
  });

  // 3. Konversi ke Array dan urutkan
  const history = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => a - b)
    .map(y => ({
      year: y,
      actualRevenue: yearlyData[y].revenue,
      actualExpense: yearlyData[y].expense,
      predictedRevenue: null as number | null, // null untuk grafik
      predictedExpense: null as number | null,
    }));

  // Jika data kosong, beri data default agar grafik tidak rusak
  if (history.length === 0) {
    history.push({ year: new Date().getFullYear(), actualRevenue: 0, actualExpense: 0, predictedRevenue: null, predictedExpense: null });
  }

  // 4. Kalkulasi Tingkat Pertumbuhan (MOCK AI LOGIC)
  // Untuk contoh ini, jika data < 2 tahun, kita asumsikan pertumbuhan optimis 15% per tahun
  let revGrowth = 0.15; 
  let expGrowth = 0.08; 

  if (history.length > 1) {
    const first = history[0];
    const last = history[history.length - 1];
    const yearDiff = last.year - first.year;
    
    if (first.actualRevenue > 0 && yearDiff > 0) {
      revGrowth = Math.pow(last.actualRevenue / first.actualRevenue, 1 / yearDiff) - 1;
    }
    if (first.actualExpense > 0 && yearDiff > 0) {
      expGrowth = Math.pow(last.actualExpense / first.actualExpense, 1 / yearDiff) - 1;
    }
  }

  // Batasi pertumbuhan tidak masuk akal (Min -10%, Max 40%)
  revGrowth = Math.max(-0.10, Math.min(revGrowth, 0.40));
  expGrowth = Math.max(0.02, Math.min(expGrowth, 0.20));

  // 5. GENERATE PREDIKSI MASA DEPAN
  const lastData = history[history.length - 1];
  let currentRev = lastData.actualRevenue || 10000000; // Fallback jika 0
  let currentExp = lastData.actualExpense || 5000000;

  // Titik sambung (Connecting Point) untuk grafik
  lastData.predictedRevenue = lastData.actualRevenue;
  lastData.predictedExpense = lastData.actualExpense;

  const predictions = [];
  for (let i = 1; i <= yearsAhead; i++) {
    // Tambahkan sedikit noise/variasi acak agar terlihat seperti simulasi AI organik (-3% hingga +3%)
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
    }
  };
}

export async function getRealAISuggestions(metrics: any) {
  // 1. Lacak apakah fungsi benar-benar dipanggil
  console.log("🟢 [DEBUG AI] 1. Fungsi getRealAISuggestions mulai dipanggil...");

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 2. Lacak apakah API Key terbaca oleh Next.js
    console.log("🟢 [DEBUG AI] 2. Status API Key:", apiKey ? "Terbaca (Aman)" : "KOSONG!");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tidak ditemukan di file .env");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // 3. Lacak proses pengiriman ke Google
    console.log("🟢 [DEBUG AI] 3. Sedang menghubungi server Google Gemini...");
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // 4. Lacak jawaban mentah dari AI
    console.log("🟢 [DEBUG AI] 4. Balasan Mentah Gemini:", responseText);
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      console.log("🟢 [DEBUG AI] 5. Parsing JSON Berhasil!");
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("AI membalas dengan format yang salah.");
    }

  } catch (error) {
    // 5. Jika error, ini WAJIB muncul warna merah di terminal
    console.error("🔴 [DEBUG AI ERROR] Terjadi kegagalan:", error); 
    
    return [
      "Pertahankan stabilitas arus kas Anda bulan ini.",
      "Lakukan audit pada pengeluaran operasional terbesar.",
      "Pantau tingkat perputaran stok barang terlaris Anda."
    ];
  }
}

export async function getRealAIAnalysis(metrics: any, years: number) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gagal mengambil analisis AI:", error);
    return {
      summary: `Berdasarkan data historis, sistem memproyeksikan pertumbuhan sebesar ${metrics.cagr}% selama ${years} tahun ke depan.`,
      opportunity: "Fokus pada stabilisasi operasional dan perluasan pangsa pasar secara bertahap.",
      risk: "Pantau fluktuasi biaya operasional yang dapat menekan margin laba di masa depan."
    };
  }
}