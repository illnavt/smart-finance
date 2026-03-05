import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";

function Navbar() {
  return (
    <header className="w-full h-[80px] px-[8%] flex justify-between items-center shadow-sm sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="logo-container">
        <Image
          src="/images/logo.png"
          alt="Ke-Pin Logo"
          width={150}
          height={50}
          className="h-10 w-auto block"
        />
      </div>

      <nav className="hidden lg:block">
        <ul className="flex list-none gap-10">
          <li>
            <Link
              href=""
              className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors"
            >
              Beranda
            </Link>
          </li>
          <li>
            <Link
              href="#visi-misi"
              className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors"
            >
              Visi & Misi
            </Link>
          </li>
          <li>
            <Link
              href="#fitur"
              className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors"
            >
              Fitur
            </Link>
          </li>
        </ul>
      </nav>

      <Link
        href="/auth"
        className="hidden lg:inline-flex bg-gradient-to-r from-[#94cd28] to-[#29a343] text-white py-2.5 px-8 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#29a343]/30 transition-all hover:-translate-y-0.5"
      >
        Login
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="beranda"
      className="relative w-full min-h-[calc(100vh-80px)] scroll-mt-[80px] flex items-center px-[8%] py-16 lg:py-0 justify-center lg:justify-start text-center lg:text-left bg-[#f8fdfa] overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-[#94cd28] to-[#29a343] rounded-full opacity-[0.15] blur-[100px]"></div>
        <div className="absolute bottom-10 -right-32 w-[400px] h-[400px] bg-[#94cd28] rounded-full opacity-10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-[850px] mb-12 lg:mb-0 mt-10 lg:mt-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#18983C] font-bold text-sm mb-6 border border-[#94cd28]/30 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#94cd28] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#29a343]"></span>
          </span>
          Solusi Keuangan Cerdas
        </div>
        <h1 className="text-5xl xl:text-[64px] font-extrabold leading-[1.1] mb-6 whitespace-normal xl:whitespace-nowrap text-[#023A4B] tracking-tight">
          Mengatur Keuangan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18983C] to-[#94cd28]">
            Menggunakan AI
          </span>
        </h1>
        <p className="text-lg leading-relaxed max-w-[600px] mx-auto lg:mx-0 mb-10 text-gray-600 font-medium">
          Dengan kemampuan{" "}
          <strong className="text-[#29a343] font-bold">
            Artificial Intelligence
          </strong>
          , kembangkan dan pantau kesehatan bisnis Anda agar selalu sejalan
          dengan tujuan utama secara real-time.
        </p>

        <Link
          href="#fitur"
          className="inline-flex items-center bg-[#0a3d4d] text-white py-4 px-10 rounded-full font-bold text-lg gap-3 shadow-xl shadow-[#0a3d4d]/20 hover:bg-[#023A4B] hover:-translate-y-1 transition-all"
        >
          Mulai Sekarang &rarr;
        </Link>
      </div>

      <div className="absolute right-[-10%] lg:right-[-5%] top-1/2 -translate-y-1/2 w-[200%] lg:w-[80%] opacity-10 lg:opacity-80 z-0 pointer-events-none drop-shadow-2xl">
        <Image
          src="/images/hero-image.png"
          alt="Background Illustrasi"
          width={1200}
          height={1000}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <Link
          href="#visi-misi"
          className="text-[#0a3d4d] flex flex-col items-center gap-2 hover:text-[#29a343] transition-colors"
        >
          <span className="text-sm font-semibold uppercase tracking-widest">
            Scroll
          </span>
          &darr;
        </Link>
      </div>
    </section>
  );
}

function VisiMisi() {
  return (
    <section
      id="visi-misi"
      className="w-full relative flex flex-col justify-center items-center py-16 px-[8%] min-h-[calc(100vh-80px)] scroll-mt-[80px] bg-[#0a3d4d] text-center text-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#29a343] rounded-full filter blur-[150px] opacity-20"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#94cd28] rounded-full filter blur-[150px] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0f5c73] rounded-full filter blur-[150px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-4 text-[#94cd28] font-bold tracking-widest uppercase text-sm">
          Tujuan Utama
        </div>
        <h2 className="text-[32px] md:text-[42px] font-extrabold mb-4 tracking-tight">
          Visi & Misi Kami
        </h2>
        <p className="text-lg max-w-[650px] mx-auto mb-16 text-gray-300 leading-relaxed">
          Kami berkomitmen untuk memajukan bisnis Indonesia menuju masa depan
          yang cerah, terstruktur, dan sangat efisien.
        </p>

        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-12">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 text-white text-center transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:border-[#94cd28]/50 hover:shadow-[0_20px_40px_rgba(148,205,40,0.1)] w-full max-w-[350px] flex flex-col items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#94cd28] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
              <Image
                src="/images/icon-otomatisasi.png"
                alt="Otomatisasi"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="text-2xl font-bold mb-4">Otomatisasi</h4>
            <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
              Menyediakan sistem pencatatan keuangan yang real-time, transparan,
              dan meminimalisir kesalahan manusia.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 text-white text-center transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:border-[#94cd28]/50 hover:shadow-[0_20px_40px_rgba(148,205,40,0.1)] w-full max-w-[350px] flex flex-col items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#94cd28] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
              <Image
                src="/images/icon-prediksi.png"
                alt="Prediksi"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="text-2xl font-bold mb-4">Prediksi AI</h4>
            <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
              Memanfaatkan kecerdasan buatan untuk menganalisis tren dan
              memberikan wawasan strategi keuangan masa depan.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 text-white text-center transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 hover:border-[#94cd28]/50 hover:shadow-[0_20px_40px_rgba(148,205,40,0.1)] w-full max-w-[350px] flex flex-col items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#94cd28] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
              <Image
                src="/images/icon-efisiensi.png"
                alt="Efisiensi"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h4 className="text-2xl font-bold mb-4">Efisiensi</h4>
            <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
              Mengoptimalkan alur kerja bisnis agar lebih terstruktur, hemat
              waktu, dan tentunya lebih menguntungkan.
            </p>
          </div>
        </div>

        <Link
          href="#fitur"
          className="inline-flex items-center gap-2.5 bg-[#94cd28] text-[#0a3d4d] py-3.5 px-8 rounded-full font-bold text-sm shadow-[0_0_30px_rgba(148,205,40,0.2)] transition-transform duration-300 hover:-translate-y-1 hover:bg-white"
        >
          Lihat Fitur Kami &darr;
        </Link>
      </div>
    </section>
  );
}

function Features() {
  const staticFeatures = [
    { id: 1, title: "Laba Kotor Bulanan" },
    { id: 2, title: "Total Pendapatan" },
    { id: 3, title: "Biaya Akusisi (CAC)" },
    { id: 4, title: "Nilai Pelanggan (CLV)" },
    { id: 5, title: "Tingkat Keberhasilan" },
    { id: 6, title: "Total Profit Margin" },
    { id: 7, title: "Laba Bersih Akurat" },
    { id: 8, title: "Retensi Pelanggan" },
    { id: 9, title: "Tingkat Konversi" },
    { id: 10, title: "Arus Kas Operasi" },
    { id: 11, title: "Strategi AI Pintar" },
    { id: 12, title: "Pemantauan Kerugian" },
    { id: 13, title: "Manajemen Stok" },
  ];

  return (
    <section
      id="fitur"
      className="w-full relative flex flex-col justify-center items-center py-16 px-[8%] min-h-[calc(100vh-80px)] scroll-mt-[80px] bg-[#f8fdfa] overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 right-[-10%] w-[700px] h-[700px] bg-gradient-to-bl from-[#e8f5d6] to-transparent rounded-full opacity-60 blur-[80px]"></div>
        <div className="absolute bottom-10 -left-20 w-[500px] h-[500px] bg-[#94cd28] rounded-full opacity-5 blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center mb-16">
        <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0a3d4d] tracking-tight">
          Analitik Lengkap & Powerful
        </h2>
        <p className="text-gray-500 mt-3 text-lg font-medium">
          Semua metrik dan grafik yang Anda butuhkan dalam satu dashboard
          elegan.
        </p>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-20 w-full max-w-[1200px]">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-[#0a3d4d]/5 text-center w-full max-w-[380px] border border-gray-100/50 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#94cd28] to-[#29a343]"></div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#94cd28]/10 rounded-full blur-2xl group-hover:bg-[#94cd28]/20 transition-colors"></div>

          <h4 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-4 mt-2">
            Mulai Dari
          </h4>

          <div className="flex items-start justify-center text-[#0a3d4d] my-4">
            <span className="text-2xl font-bold mt-2 mr-1">Rp</span>
            <span className="text-6xl font-black tracking-tighter">XX</span>
            <span className="text-2xl font-bold mt-auto mb-2 ml-1">.xxx</span>
          </div>

          <p className="text-gray-400 font-medium mb-8">/ bulan</p>

          <Link
            href="/auth"
            className="inline-flex items-center justify-center bg-[#0a3d4d] text-white py-4 px-8 rounded-2xl font-bold text-lg w-full hover:bg-gradient-to-r hover:from-[#94cd28] hover:to-[#29a343] transition-all duration-300 shadow-lg shadow-transparent hover:shadow-[#29a343]/30"
          >
            Daftar Sekarang
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 lg:gap-x-12 text-left self-center w-full lg:flex-1 mt-8 lg:mt-0">
          {staticFeatures.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 text-[#0a3d4d] group cursor-default bg-white/40 p-3 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm"
            >
              <div className="bg-[#e8f5d6] p-1 rounded-full shrink-0 group-hover:scale-110 group-hover:bg-[#94cd28] transition-all duration-300">
                <CheckCircle2
                  className="w-5 h-5 text-[#29a343] group-hover:text-white"
                  strokeWidth={2.5}
                />
              </div>
              <span className="font-semibold text-[15px] leading-tight pt-1 capitalize-first text-gray-700 group-hover:text-[#0a3d4d] transition-colors">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-[#062630] text-white pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#94cd28] to-[#29a343]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#29a343] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#94cd28] rounded-full blur-[100px] opacity-[0.05] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="flex flex-col gap-6 lg:pr-8">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Ke-Pin Logo"
                width={140}
                height={45}
                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Platform manajemen keuangan cerdas berbasis AI untuk membantu
              bisnis Anda tumbuh lebih cepat, efisien, dan transparan.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href="#"
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all hover:-translate-y-1"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all hover:-translate-y-1"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all hover:-translate-y-1"
              >
                <Linkedin size={18} />
              </Link>
              <Link
                href="#"
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all hover:-translate-y-1"
              >
                <Facebook size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Produk</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400 font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Harga
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Integrasi API
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Studi Kasus
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Perusahaan</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400 font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Karir
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[#94cd28] transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Hubungi Kami</h4>
            <ul className="flex flex-col gap-5 text-sm text-gray-400 font-medium">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0 mt-0.5">
                  <MapPin size={16} className="text-[#94cd28]" />
                </div>
                <span className="leading-relaxed">
                  Jl. Teknologi No. 12, Samarinda, Kalimantan Timur, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  <Mail size={16} className="text-[#94cd28]" />
                </div>
                <a
                  href="mailto:hello@ke-pin.id"
                  className="hover:text-white transition-colors"
                >
                  hello@ke-pin.id
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  <Phone size={16} className="text-[#94cd28]" />
                </div>
                <a
                  href="tel:+6281234567890"
                  className="hover:text-white transition-colors"
                >
                  +62 812 3456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 font-medium">
          <p>&copy; {new Date().getFullYear()} Ke-Pin. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="scroll-smooth">
      <Navbar />
      <Hero />
      <VisiMisi />
      <Features />
      <Footer />
    </main>
  );
}
