"use client";

import {
  TrendingUp,
  Trash2,
  Wallet,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Box,
  CreditCard,
  PieChart,
  UserPlus,
  Target,
  BrainCircuit,
  BarChart3,
  LogOut, // <-- Tambahkan import LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import { resetDataAction } from "@/app/actions/dashboard";
import { logoutAction } from "@/app/actions/auth-actions"; // <-- Import aksi logout

export default function DashboardMetrics({ userId }: { userId: string }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const data = await getDashboardMetrics();
      setMetrics(data);
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-bold text-[#0a3d4d]">
        Mengkalkulasi Metrik AI...
      </div>
    );

  const kpiData = [
    {
      title: "Laba Kotor",
      value: metrics.labaKotor,
      icon: <Wallet />,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trend: "+12.5%",
    },
    {
      title: "Laba Bersih",
      value: metrics.labaBersih,
      icon: <TrendingUp />,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+8.2%",
    },
    {
      title: "Total Pendapatan",
      value: metrics.totalPendapatan,
      icon: <CreditCard />,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      trend: "+15.0%",
    },
    {
      title: "Arus Kas Bersih",
      value: metrics.labaBersih,
      icon: <BarChart3 />,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      trend: "Stabil",
    },
    {
      title: "Total Profit",
      value: metrics.labaKotor,
      icon: <PieChart />,
      color: "text-teal-600",
      bg: "bg-teal-100",
      trend: "+5.4%",
    },
    {
      title: "Total Kerugian",
      value: 0,
      icon: <ArrowUpRight className="rotate-90" />,
      color: "text-red-600",
      bg: "bg-red-100",
      trend: "0%",
    },
    {
      title: "Stok Barang",
      value: metrics.totalStok,
      icon: <Box />,
      color: "text-orange-600",
      bg: "bg-orange-100",
      trend: "Normal",
      isCurrency: false,
    },
    {
      title: "Konversi",
      value: 85,
      icon: <Target />,
      color: "text-pink-600",
      bg: "bg-pink-100",
      trend: "+2.1%",
      isCurrency: false,
      suffix: "%",
    },
    {
      title: "Retensi Pelanggan",
      value: 72,
      icon: <Users />,
      color: "text-violet-600",
      bg: "bg-violet-100",
      trend: "+4.3%",
      isCurrency: false,
      suffix: "%",
    },
    {
      title: "CAC (Marketing)",
      value: 15000,
      icon: <UserPlus />,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: "-1.2%",
    },
    {
      title: "CLV (LTV)",
      value: metrics.clv,
      icon: <ShoppingBag />,
      color: "text-rose-600",
      bg: "bg-rose-100",
      trend: "+10.1%",
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a3d4d]">
            Ringkasan Eksekutif
          </h1>
          <p className="text-gray-500 font-medium">
            Data real-time berdasarkan analisis AI terbaru.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#0a3d4d] focus:ring-2 focus:ring-[#29a343] outline-none">
            <option>Bulan Ini</option>
            <option>3 Bulan Terakhir</option>
            <option>Tahun Ini</option>
          </select>

          {/* Tombol Logout Baru */}
          <div className="flex items-center gap-3">
            {/* Tombol Reset Data (Hapus Semua) */}
            <button
              onClick={async () => {
                if (
                  confirm(
                    "Apakah Anda yakin ingin menghapus seluruh data dan kembali ke halaman upload?",
                  )
                ) {
                  await resetDataAction();
                }
              }}
              className="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-5 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer active:scale-95 border border-amber-100"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Reset Data</span>
            </button>

            {/* Tombol Logout */}
            <form action={logoutAction}>
              <button type="submit" className="...">
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </form>
          </div>

          <button className="bg-[#29a343] hover:bg-[#238a39] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95">
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Grid 11 Kartu Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiData.map((card, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(41,163,67,0.1)] transition-all duration-500 group cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-4 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}
              >
                {card.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${card.trend.includes("-") ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
              >
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {card.title}
              </p>
              <h3 className="text-2xl font-black text-[#0a3d4d] mt-1 tracking-tight">
                {card.isCurrency === false ? "" : "Rp "}
                {card.value.toLocaleString("id-ID")}
                {card.suffix || ""}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Section Grafik & Saran AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[450px] flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="text-gray-300" size={40} />
          </div>
          <h4 className="text-[#0a3d4d] font-bold text-xl">
            Visualisasi Grafik Pendapatan
          </h4>
          <p className="text-gray-400 max-w-xs">
            AI sedang menyiapkan diagram batang untuk tren bulanan Anda.
          </p>
        </div>

        <div className="bg-[#0a3d4d] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#29a343]/20 rounded-full blur-3xl group-hover:bg-[#94cd28]/30 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-[#29a343] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h4 className="text-white font-black text-2xl mb-4">
              Saran AI Pintar
            </h4>
            <p className="text-gray-300 font-medium leading-relaxed mb-6">
              "Berdasarkan data stok, produk <b>'Laptop'</b> akan habis dalam 5
              hari. Sebaiknya lakukan restock sekarang untuk menjaga tingkat
              konversi tetap di atas 80%."
            </p>
            <button className="mt-auto w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-4 rounded-2xl font-bold transition-all">
              Lihat Analisis Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
