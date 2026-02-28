import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ke-Pin - Keuangan Pintar",
  description: "Mengatur keuangan menggunakan AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-[#fbffee] text-[#0a3d4d] overflow-x-hidden relative min-h-screen`}>
        <div className="absolute w-[800px] h-[800px] -left-[400px] -top-[100px] bg-[#18983c] opacity-[0.12] rounded-full -z-10 blur-[80px]"></div>
        {children}
      </body>
    </html>
  );
}