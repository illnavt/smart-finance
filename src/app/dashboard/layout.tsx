// src/app/dashboard/layout.tsx
import Link from "next/link";
import { 
  LayoutDashboard, Receipt, FileText, BrainCircuit, 
  LineChart, Package, Search, Bell, UserCircle 
} from "lucide-react"; // <-- SUDAH DIPERBAIKI
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userEmail = session?.email as string;
  const userId = session?.userId as string;

  const hasData = await prisma.product.findFirst({
    where: { idUser: userId }
  });

  // LOGIKA: Jika file belum ada, layout tidak muncul
  if (!hasData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#e8f7ec] via-[#f2fdf5] to-[#d1f5de]">
        <main className="w-full flex items-center justify-center min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* SIDEBAR KIRI (Sudah diperbaiki css conflict-nya) */}
      <aside className="w-64 bg-[#0a3d4d] text-white flex-col shadow-xl z-20 hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Image 
            src="/images/logo.png" 
            alt="Ke-Pin Logo" 
            width={120} 
            height={40} 
            className="h-8 w-auto brightness-0 invert object-contain"
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Modul Utama</p>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#29a343] text-white rounded-xl font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href="/dashboard/transaksi" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 rounded-xl">
            <Receipt size={20} /> Transaksi
          </Link>
          <Link href="/dashboard/stok" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 rounded-xl">
            <Package size={20} /> Stok Barang
          </Link>
        </nav>

        {/* User Profile (Hanya Email) */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
            <UserCircle size={32} className="text-[#94cd28]" />
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-300 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* AREA KANAN */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#29a343]/50"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-gray-400 hover:text-[#0a3d4d]">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <div className="w-10 h-10 bg-linear-to-br from-[#94cd28] to-[#29a343] rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                {userEmail?.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-6">
          {children}
        </main>
      </div>
    </div>
  );
}