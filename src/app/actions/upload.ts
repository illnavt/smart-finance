"use server";

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * FUNGSI PINTAR: Mencari nilai kolom berdasarkan Fuzzy Matching
 */
function findValue(
  row: any,
  possibleNames: string[],
  defaultValue: any = null,
) {
  const keys = Object.keys(row);
  for (const key of keys) {
    const cleanKey = key.toLowerCase().trim().replace(/\s+/g, "");
    for (const name of possibleNames) {
      const cleanName = name.toLowerCase().trim().replace(/\s+/g, "");
      if (cleanKey.includes(cleanName)) return row[key];
    }
  }
  return defaultValue;
}

/**
 * FUNGSI PINTAR: Pembersihan angka
 */
function cleanNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
}

/**
 * FUNGSI PINTAR: Konversi tanggal
 */
/**
 * FUNGSI PINTAR: Konversi tanggal dengan dukungan DD/MM/YYYY
 */
function parseExcelDate(excelDate: any) {
  if (!excelDate) return new Date();

  // 1. Jika dibaca Excel sebagai Serial Number (angka)
  if (typeof excelDate === "number") {
    return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  }

  // 2. Jika dibaca sebagai Teks (contoh: "24/09/2025")
  if (typeof excelDate === "string") {
    const parts = excelDate.split("/");
    // Cek apakah formatnya dipisah garis miring dan ada 3 bagian
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Di JavaScript, bulan dimulai dari 0 (Jan = 0)
      const year = parseInt(parts[2], 10);
      
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
  }

  // 3. Fallback bawaan
  let date = new Date(excelDate);
  return isNaN(date.getTime()) ? new Date() : date;
}

export async function uploadTransactionFile(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.userId) throw new Error("Sesi habis. Silakan login kembali.");
    const userId = session.userId as string;

    const userProfile = await prisma.profile.findFirst({
      where: { idUser: userId },
      select: { idDepartemen: true },
    });

    if (!userProfile) throw new Error("Akses Departemen tidak ditemukan.");
    const currentDeptId = userProfile.idDepartemen;

    const file = formData.get("file") as File | null;
    if (!file) throw new Error("File tidak ditemukan.");

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    let totalBarisBerhasil = 0;

    for (const sheetName of workbook.SheetNames) {
      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
      ) as any[];
      if (jsonData.length === 0) continue;

      const headerStr = Object.keys(jsonData[0])
        .join("")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      let tipeLaporan = "TRANSAKSI";
      if (
        headerStr.includes("sisastok") ||
        headerStr.includes("hpp") ||
        headerStr.includes("stok")
      ) {
        tipeLaporan = "STOK_BARANG";
      } else if (
        headerStr.includes("kas") ||
        headerStr.includes("pengeluaran") ||
        headerStr.includes("pemasukan")
      ) {
        tipeLaporan = "KEUANGAN";
      }

      for (const row of jsonData) {
        if (tipeLaporan === "STOK_BARANG") {
          const namaProduk = findValue(
            row,
            ["namabarang", "produk", "item"],
            "Produk Baru",
          );
          const sisaStok = cleanNumber(
            findValue(row, ["sisastok", "sisa", "stokakhir"]),
          );
          const modalHpp = cleanNumber(
            findValue(row, ["hargabelipokok", "hpp", "modal"]),
          );

          // MENGGUNAKAN UPSERT DENGAN ID_NAME_DEPT (Best Practice)
          await prisma.product.upsert({
            where: {
              id_name_dept: { name: namaProduk, idDepartemen: currentDeptId },
            },
            update: { stok: sisaStok, hpp: modalHpp },
            create: {
              name: namaProduk,
              stok: sisaStok,
              hpp: modalHpp,
              price: modalHpp * 1.5,
              idUser: userId,
              idDepartemen: currentDeptId,
            },
          });
        } else if (tipeLaporan === "TRANSAKSI") {
          const namaProduk = findValue(
            row,
            ["namabarang", "produk"],
            "Produk Tanpa Nama",
          );
          const hargaSatuan = cleanNumber(
            findValue(row, ["hargasatuan", "price"]),
          );
          const qty = cleanNumber(findValue(row, ["qty", "jumlah"]));
          const tanggal = parseExcelDate(findValue(row, ["tanggal", "date"]));

          // Sinkronisasi produk otomatis agar idProduct valid
          const produk = await prisma.product.upsert({
            where: {
              id_name_dept: { name: namaProduk, idDepartemen: currentDeptId },
            },
            update: {},
            create: {
              name: namaProduk,
              price: hargaSatuan,
              idUser: userId,
              idDepartemen: currentDeptId,
            },
          });

          const rawCustomer = findValue(row, ["pelanggan", "customer"], "Umum");

          await prisma.sales.create({
            data: {
              idUser: userId,
              idDepartemen: currentDeptId,
              idProduct: produk.id,
              amount: qty,
              totalPrice: hargaSatuan * qty,
              customerName: String(rawCustomer), // Menghindari error tipe data
              status: "Berhasil",
              descriptions: `Import Multi-Sheet: ${file.name}`,
              created_at: tanggal,
            },
          });
        } else if (tipeLaporan === "KEUANGAN") {
          const tipeKas = findValue(row, ["tipe", "jeniskas"], "Pengeluaran");
          const nominal = cleanNumber(findValue(row, ["nominal", "jumlah"]));

          await prisma.cashFlow.create({
            data: {
              idUser: userId,
              idDepartemen: currentDeptId,
              tipe: tipeKas,
              kategori: findValue(row, ["kategori", "pos"], "Operasional"),
              nominal: nominal,
              keterangan: findValue(row, ["keterangan", "rincian"], "-"),
              tanggal: parseExcelDate(findValue(row, ["tanggal", "date"])),
            },
          });
        }
        totalBarisBerhasil++;
      }
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Berhasil! Memproses total ${totalBarisBerhasil} data.`,
    };
  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    throw new Error(error.message || "Gagal memproses file Excel multi-sheet.");
  }
}