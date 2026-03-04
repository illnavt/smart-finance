"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  BrainCircuit,
  Package,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", href: "/dashboard/transaksi", icon: Receipt },
    { name: "Laporan Keuangan", href: "/dashboard/laporan", icon: FileText },
    { name: "Prediksi AI", href: "/dashboard/analitik", icon: BrainCircuit },
    { name: "Stok Barang", href: "/dashboard/stok", icon: Package },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-2 relative z-10 custom-scrollbar">
      <p className="px-3 text-[11px] font-black text-gray-400/60 uppercase tracking-[0.2em] mb-5">
        Menu Navigasi
      </p>

      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name} 
            href={item.href}
            className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden ${
              isActive
                ? "bg-gradient-to-r from-[#29a343] to-[#1e8031] text-white font-bold shadow-lg shadow-[#29a343]/30 translate-x-1"
                : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1 font-medium"
            }`}
          >
            {/* Indikator Garis Menyala (Active State) */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#94cd28] shadow-[0_0_12px_#94cd28] rounded-r-full" />
            )}

            <item.icon
              size={22}
              className={`transition-all duration-300 ${
                isActive
                  ? "text-white scale-110 drop-shadow-md"
                  : "text-gray-400 group-hover:text-[#94cd28]"
              }`}
            />
            <span className="tracking-wide">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}