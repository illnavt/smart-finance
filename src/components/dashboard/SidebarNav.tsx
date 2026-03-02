"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  BrainCircuit,
  LineChart,
  Package,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", href: "/dashboard/transaksi", icon: Receipt },
    { name: "Laporan Keuangan", href: "/dashboard/laporan", icon: FileText },
    { name: "Prediksi AI", href: "/dashboard/prediksi", icon: BrainCircuit },
    { name: "Stok Barang", href: "/dashboard/stok", icon: Package },
    { name: "Analitik", href: "/dashboard/analitik", icon: LineChart },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 relative z-10 custom-scrollbar">
      <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        Menu Utama
      </p>

      {navItems.map((item) => {
        // Logika agar deteksi rute akurat
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-[#29a343] to-[#238a39] text-white font-medium shadow-lg shadow-[#29a343]/20"
                : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"
            }`}
          >
            <item.icon
              size={20}
              className={
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-[#94cd28] transition-colors"
              }
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}