import Link from "next/link";
import Image from "next/image";
import { Search, Bell, UserCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import SidebarNav from "@/components/dashboard/SidebarNav"; // <--- IMPORT INI

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  // Ambil email dari database agar tidak blank jika session email kosong
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  });
  const userEmail = userData?.email || (session?.email as string) || "admin@sistem.com";

  const hasData = await prisma.product.findFirst({
    where: { idUser: userId },
  });

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f7ec] via-[#f2fdf5] to-[#d1f5de]">
        <main className="w-full flex items-center justify-center min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans selection:bg-[#29a343]/30">
      <aside className="w-[280px] bg-[#0a3d4d] text-white flex flex-col shadow-2xl z-20 hidden md:flex relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="h-24 flex items-center justify-center border-b border-white/5 relative z-10">
          <Image src="/images/logo.png" alt="Ke-Pin Logo" width={140} height={45} className="brightness-0 invert object-contain drop-shadow-md" />
        </div>

        {/* PANGGIL KOMPONEN NAVIGASI DI SINI */}
        <SidebarNav />

        <div className="p-6 relative z-10 border-t border-white/5">
          <div className="flex items-center gap-3 bg-black/20 hover:bg-black/30 transition-colors p-3.5 rounded-2xl cursor-pointer border border-white/5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#94cd28] to-[#29a343] flex items-center justify-center shadow-inner">
              <UserCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate group-hover:text-[#94cd28] transition-colors">{userEmail}</p>
              <p className="text-[10px] text-gray-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* SISA KODE HEADER & MAIN (SAMA SEPERTI SEBELUMNYA) */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc]">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="relative w-full max-w-md hidden sm:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#29a343] transition-colors" size={18} />
            <input type="text" placeholder="Pencarian cepat..." className="w-full bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:bg-white focus:ring-4 focus:ring-[#29a343]/10 focus:border-[#29a343]/30 transition-all outline-none" />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-2.5 text-gray-400 hover:text-[#0a3d4d] hover:bg-gray-100 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_0_2px_white]" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-[#0a3d4d] group-hover:text-[#29a343] transition-colors">{userEmail?.split("@")[0] || "User"}</p>
                <p className="text-[10px] font-medium text-gray-400">Active Session</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-[#94cd28] to-[#29a343] rounded-2xl flex items-center justify-center text-white font-bold shadow-md shadow-[#29a343]/20 group-hover:scale-105 transition-transform border-2 border-white">
                {userEmail?.substring(0, 2).toUpperCase() || "US"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-8">
          {children}
        </main>
      </div>
    </div>
  );
}