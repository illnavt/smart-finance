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
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getDashboardMetrics,
  getRevenueChart,
  getAvailableYears,
  resetDataAction,
  getRealAISuggestions,
} from "@/app/actions/dashboard";
import Link from "next/link";

export default function DashboardMetrics({ userId }: { userId: string }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [range, setRange] = useState("semua");
  const [chartData, setChartData] = useState<any[]>([]);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function init() {
      const [metricData, years] = await Promise.all([
        getDashboardMetrics(),
        getAvailableYears(),
      ]);

      setMetrics(metricData);
      setAvailableYears(years);
    }
    init();
  }, []);

  useEffect(() => {
    if (!range) return;

    async function fetchChart() {
      setLoading(true);
      const chart = await getRevenueChart(range);
      setChartData(chart);
      setLoading(false);
    }
    fetchChart();
  }, [range]);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDataAction();
      setIsResetModalOpen(false);
      window.location.href = "/dashboard";
    } catch (error) {
      setIsResetting(false);
    }
  };

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    if (!metrics) return;

    async function fetchAI() {
      setIsAiLoading(true);
      try {
        const saranDariAI = await getRealAISuggestions(metrics);
        setAiSuggestions(saranDariAI);
      } catch (error) {
        setAiSuggestions(["Sistem AI sedang sibuk, silakan coba lagi nanti."]);
      } finally {
        setIsAiLoading(false);
      }
    }

    fetchAI();
  }, [metrics]);

  if (loading && !metrics)
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
      value: metrics.totalKerugian,
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
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#0a3d4d] focus:ring-2 focus:ring-[#29a343] outline-none cursor-pointer"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                Tahun {year}
              </option>
            ))}
            <option value="bulan">Bulan Ini</option>
            <option value="3bulan">3 Bulan Terakhir</option>
            <option value="semua">Semua Waktu</option>
          </select>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-5 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer active:scale-95 border border-amber-100"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-112.5">
        {chartData.length === 0 && !loading ? (
          <div className="h-full w-full flex items-center justify-center flex-col text-gray-400">
            <BarChart3 size={48} className="mb-2 opacity-50" />
            <p>Belum ada data pendapatan di periode ini.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#29a343" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#29a343" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
                tickFormatter={(value) =>
                  `Rp${value >= 1000000 ? (value / 1000000).toFixed(1) + "M" : value >= 1000 ? (value / 1000).toFixed(0) + "K" : value}`
                }
              />
              <Tooltip
                cursor={{
                  stroke: "#29a343",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  padding: "12px 20px",
                  fontWeight: "bold",
                  color: "#0a3d4d",
                }}
                formatter={(value: number | undefined) => [
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(value || 0),
                  "Pendapatan",
                ]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#29a343"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorTotal)"
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#0a3d4d" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-linear-to-br from-[#0a3d4d] to-[#062630] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#29a343]/20 rounded-full blur-3xl group-hover:bg-[#94cd28]/30 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="bg-[#29a343] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainCircuit className="text-white" size={24} />
              </div>
              <span className="bg-[#29a343]/20 text-[#94cd28] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse border border-[#29a343]/30">
                Live Analysis
              </span>
            </div>

            <h4 className="text-white font-black text-2xl mb-5">
              Saran AI Pintar
            </h4>

            <div className="space-y-3 mb-6 flex-1">
              {aiSuggestions.map((saran, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/5"
                >
                  <div className="mt-0.5 text-[#94cd28]">
                    <Sparkles size={18} />
                  </div>
                  <p className="text-gray-300 text-sm font-medium leading-relaxed">
                    {saran}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/analitik"
              className="mt-auto w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-4 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 group/btn"
            >
              Lihat Analisis Detail
              <ArrowUpRight
                size={18}
                className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
              />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  {Number(card.value || 0).toLocaleString("id-ID")}
                  {card.suffix || ""}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></span>
                <Trash2 size={40} strokeWidth={2.5} className="relative z-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#0a3d4d] mb-3">
                  Reset Sistem?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong>seluruh data operasional</strong> secara permanen?
                  Anda akan dikembalikan ke halaman awal.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="flex-1 px-4 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg cursor-pointer shadow-red-200 disabled:opacity-50 flex justify-center items-center"
                >
                  {isResetting ? "Meriset..." : "Ya, Hapus Data"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
