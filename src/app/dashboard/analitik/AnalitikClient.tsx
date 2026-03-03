"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  TrendingUp,
  Wallet,
  Target,
  Sparkles,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { getAIPredictionAction } from "@/app/actions/dashboard";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

const formatShortRupiah = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}Rb`;
  return `Rp ${value}`;
};

export default function AnalitikClient() {
  const [years, setYears] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ chartData: [], metrics: {} });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getAIPredictionAction(years);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [years]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a3d4d] tracking-tight flex items-center gap-3">
            <Sparkles className="text-amber-500" size={28} />
            Prediksi Analitik AI
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Proyeksi cerdas menggunakan *Machine Learning* berdasarkan riwayat
            arus kas Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
          {[5, 10, 15].map((y) => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                years === y
                  ? "bg-[#0a3d4d] text-white shadow-md"
                  : "text-gray-500 hover:text-[#0a3d4d] hover:bg-gray-100"
              }`}
            >
              {y} Tahun
            </button>
          ))}
        </div>
      </div>

      {/* KARTU METRIK AI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#0a3d4d] to-[#0f5c73] p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#94cd28]/20 transition-colors duration-700" />
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Target size={28} strokeWidth={2.5} className="text-[#94cd28]" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Potensi Pendapatan ({currentYear + years})
            </p>
            <h3 className="text-2xl font-black mt-1">
              {loading
                ? "Menghitung..."
                : formatRupiah(data.metrics?.projectedRevenue)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Estimasi Laba Bersih ({currentYear + years})
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {loading ? "..." : formatRupiah(data.metrics?.projectedProfit)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden group">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tren Pertumbuhan (YoY)
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {loading ? "..." : `+${data.metrics?.cagr}%`}{" "}
              <span className="text-sm font-semibold text-gray-400">
                / tahun
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* CHART PREDIKSI MODERN */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col w-full overflow-hidden relative">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h4 className="text-[#0a3d4d] font-bold text-xl flex items-center gap-2">
              <Activity size={20} className="text-[#29a343]" /> Grafik Proyeksi
              Pendapatan
            </h4>
            <p className="text-gray-400 text-sm mt-1">
              Simulasi garis solid (Data Asli) vs garis putus-putus (Prediksi
              AI)
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0a3d4d]"></span>
              <span className="text-xs font-bold text-gray-500">Asli</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#29a343]"></span>
              <span className="text-xs font-bold text-gray-500">Prediksi</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px]">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#29a343] font-bold">
              <BrainCircuit
                size={48}
                className="animate-pulse mb-3 opacity-50"
              />
              AI sedang menganalisa matriks data Anda...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  {/* Gradasi Asli */}
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a3d4d" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0a3d4d" stopOpacity={0} />
                  </linearGradient>
                  {/* Gradasi Prediksi */}
                  <linearGradient
                    id="colorPredicted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
                  tickFormatter={formatShortRupiah}
                  width={80}
                />

                <Tooltip
                  cursor={{
                    stroke: "#9ca3af",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    padding: "12px 20px",
                  }}
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [
                    // <-- Tambahkan | undefined pada name
                    formatRupiah(value || 0),
                    name === "actualRevenue"
                      ? "Pendapatan Asli"
                      : "Prediksi AI",
                  ]}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#0a3d4d",
                    marginBottom: "4px",
                  }}
                />

                {/* Garis Batas Tahun Sekarang */}
                <ReferenceLine
                  x={currentYear}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    position: "top",
                    value: "Sekarang",
                    fill: "#ef4444",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />

                {/* GRAFIK DATA ASLI */}
                <Area
                  type="monotone"
                  dataKey="actualRevenue"
                  stroke="#0a3d4d"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#0a3d4d" }}
                />

                {/* GRAFIK PREDIKSI MASA DEPAN */}
                <Area
                  type="monotone"
                  dataKey="predictedRevenue"
                  stroke="#29a343"
                  strokeWidth={4}
                  strokeDasharray="8 6" // Garis putus-putus futuristik
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#29a343" }}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
