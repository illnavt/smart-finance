import Link from "next/link";
import Image from "next/image";
import { Bell, LogOut, CalendarDays, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import SidebarNav from "@/components/dashboard/SidebarNav";
import { logoutAction } from "@/app/actions/auth-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);
  const userId = session?.userId as string;

  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const userEmail =
    userData?.email || (session?.email as string) || "admin@sistem.com";
  const userName = userEmail.split("@")[0];

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
    <div className="flex h-screen bg-[#f4f7f6] overflow-hidden font-sans selection:bg-[#29a343]/30">
      <aside className="w-[280px] bg-gradient-to-b from-[#0a3d4d] to-[#062630] text-white flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.08)] z-20 hidden md:flex relative border-r border-[#0a3d4d]">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50" />

        <div className="h-28 flex items-center justify-center border-b border-white/5 relative z-10">
          <Image
            src="/images/logo.png"
            alt="Ke-Pin Logo"
            width={150}
            height={50}
            className="brightness-0 invert object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500"
          />
        </div>

        <SidebarNav />

        <div className="p-6 relative z-10 border-t border-white/5 bg-black/10">
          <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors duration-300 p-2.5 rounded-2xl border border-white/10 group backdrop-blur-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#94cd28] to-[#29a343] flex items-center justify-center shadow-lg font-black text-white text-lg">
                {userName.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden pr-2">
                <p className="text-sm font-bold text-white truncate group-hover:text-[#94cd28] transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
                  Administrator
                </p>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Keluar dari sistem"
                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer group/btn hover:scale-105 active:scale-95"
              >
                <LogOut
                  size={18}
                  strokeWidth={2.5}
                  className="group-hover/btn:-translate-x-0.5 transition-transform duration-300"
                />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-28 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 z-10 sticky top-0 shadow-sm">
          <div className="hidden sm:flex flex-col">
            <h2 className="text-2xl font-black text-[#0a3d4d] tracking-tight">
              Halo, {userName}!{" "}
              <span className="inline-block animate-bounce origin-bottom">
                👋
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-gray-500">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Sistem Sinkron
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                <ShieldCheck size={14} className="text-[#29a343]" />
                Keamanan Aktif
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
                <CalendarDays size={14} />
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button className="relative p-3 text-gray-400 hover:text-[#29a343] hover:bg-[#29a343]/10 rounded-2xl transition-all duration-300">
              <Bell size={22} strokeWidth={2.5} />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_0_2px_white]" />
            </button>

            <div className="h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-[#0a3d4d] group-hover:text-[#29a343] transition-colors">
                  {userName}
                </p>
                <p className="text-[11px] font-bold text-gray-400">
                  Sesi Aktif
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#94cd28] to-[#29a343] rounded-[1.25rem] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#29a343]/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 border-2 border-white">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
