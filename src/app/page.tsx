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
  CheckCircle2 
} from "lucide-react";

// --- KOMPONEN NAVBAR ---
function Navbar() {
  return (
    <header className="w-full py-4 px-[8%] flex justify-between items-center shadow-sm sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
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
            <Link href="#beranda" className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors">
              Beranda
            </Link>
          </li>
          <li>
            <Link href="#visi-misi" className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors">
              Visi & Misi
            </Link>
          </li>
          <li>
            <Link href="#fitur" className="no-underline text-[#0a3d4d] font-semibold text-sm uppercase tracking-wide hover:text-[#29a343] transition-colors">
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

// --- KOMPONEN HERO ---
function Hero() {
  return (
    <section id="beranda" className="relative w-full min-h-[calc(100vh-80px)] flex items-center px-[8%] py-16 lg:py-0 justify-center lg:justify-start text-center lg:text-left bg-gradient-to-b from-white to-[#f4fcf6] overflow-hidden">
      <div className="relative z-10 max-w-[850px] mb-12 lg:mb-0 mt-10 lg:mt-0">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#e8f5d6] text-[#18983C] font-bold text-sm mb-6 border border-[#94cd28]/30">
          ✨ Solusi Keuangan Cerdas
        </div>
        <h1 className="text-5xl xl:text-[64px] font-extrabold leading-[1.1] mb-6 whitespace-normal xl:whitespace-nowrap text-[#023A4B] tracking-tight">
          Mengatur Keuangan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18983C] to-[#94cd28]">
            Menggunakan AI
          </span>
        </h1>
        <p className="text-lg leading-relaxed max-w-[600px] mx-auto lg:mx-0 mb-10 text-gray-600">
          Dengan kemampuan <strong className="text-[#0a3d4d] font-semibold">Artificial Intelligence</strong>, kembangkan dan pantau kesehatan bisnis Anda agar selalu sejalan dengan tujuan utama.
        </p>

        <Link 
          href="#fitur" 
          className="inline-flex items-center bg-[#0a3d4d] text-white py-4 px-10 rounded-full font-bold text-lg gap-3 shadow-xl shadow-[#0a3d4d]/20 hover:bg-[#023A4B] hover:-translate-y-1 transition-all"
        >
          Mulai Sekarang &rarr;
        </Link>
      </div>

      <div className="absolute right-[-5%] lg:right-[2%] top-1/2 -translate-y-1/2 w-[120%] lg:w-[55%] opacity-20 lg:opacity-100 z-[1] pointer-events-none drop-shadow-2xl">
        <Image 
          src="/images/hero-image.png" 
          alt="Background Illustrasi" 
          width={800} 
          height={600}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <Link 
          href="#visi-misi" 
          className="text-[#0a3d4d] flex flex-col items-center gap-2 hover:text-[#29a343] transition-colors"
        >
          <span className="text-sm font-semibold uppercase tracking-widest">Scroll</span>
          &darr;
        </Link>
      </div>
    </section>
  );
}

// --- KOMPONEN VISI MISI ---
function VisiMisi() {
  return (
    <section id="visi-misi" className="w-full relative flex flex-col justify-center items-center py-24 px-[8%] bg-[#0a3d4d] text-center text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#18983c] rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#94cd28] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <h2 className="text-[32px] md:text-[42px] font-extrabold mb-4 tracking-tight">Visi & Misi Kami</h2>
        <p className="text-lg max-w-[650px] mx-auto mb-16 text-gray-300 leading-relaxed">
          Kami berkomitmen untuk memajukan bisnis Indonesia menuju masa depan yang cerah dan efisien.
        </p>

        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-16">
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-white text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-[#94cd28]/50 w-full max-w-[350px] flex flex-col items-center group">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Image src="/images/icon-otomatisasi.png" alt="Otomatisasi" width={50} height={50} className="object-contain" />
            </div>
            <h4 className="text-2xl font-bold mb-4">Otomatisasi</h4>
            <p className="text-sm leading-relaxed text-gray-300">
              Menyediakan sistem pencatatan keuangan yang real-time, transparan, dan meminimalisir kesalahan manusia.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-white text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-[#94cd28]/50 w-full max-w-[350px] flex flex-col items-center group">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Image src="/images/icon-prediksi.png" alt="Prediksi" width={50} height={50} className="object-contain" />
            </div>
            <h4 className="text-2xl font-bold mb-4">Prediksi AI</h4>
            <p className="text-sm leading-relaxed text-gray-300">
              Memanfaatkan kecerdasan buatan untuk menganalisis tren dan memberikan wawasan keuangan masa depan.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 text-white text-center transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-[#94cd28]/50 w-full max-w-[350px] flex flex-col items-center group">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Image src="/images/icon-efisiensi.png" alt="Efisiensi" width={50} height={50} className="object-contain" />
            </div>
            <h4 className="text-2xl font-bold mb-4">Efisiensi</h4>
            <p className="text-sm leading-relaxed text-gray-300">
              Mengoptimalkan alur kerja bisnis agar lebih terstruktur, hemat waktu, dan menguntungkan.
            </p>
          </div>

        </div>

        <Link 
          href="#fitur" 
          className="inline-flex items-center gap-2.5 bg-[#94cd28] text-[#0a3d4d] py-3.5 px-8 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(148,205,40,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:bg-white"
        >
          Lihat Fitur Kami &darr;
        </Link>
      </div>
    </section>
  );
}

// --- KOMPONEN FEATURES (Berdasarkan Gambar) ---
function Features() {
  // Data disesuaikan 100% dengan teks yang ada di gambar referensi
  const staticFeatures = [
    { id: 1, title: "Laba kotor" },
    { id: 2, title: "Total pendapatan" },
    { id: 3, title: "Biaya akusisi pelanggan" },
    { id: 4, title: "Nilai seumur hidup" },
    { id: 5, title: "Tingkat keberhasilan" },
    { id: 6, title: "total profit" },
    { id: 7, title: "Laba bersih" },
    { id: 8, title: "tingkat retensi pelanggan" },
    { id: 9, title: "Tingkat konversi" },
    { id: 10, title: "arus kas bersih operasi" },
    { id: 11, title: "Langkah yang perlu di lakukan" },
    { id: 12, title: "total kerugian" },
    { id: 13, title: "Stok barang" },
  ];

  return (
    <section id="fitur" className="w-full relative flex flex-col justify-center items-center py-24 px-[8%] bg-gradient-to-br from-[#f0f9eb] via-[#e8f5d6] to-[#f0f9eb]">
       <div className="text-center mb-16">
         <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0a3d4d] tracking-tight">Analitik Lengkap</h2>
         <p className="text-gray-600 mt-3 text-lg">Semua metrik yang Anda butuhkan dalam satu dashboard.</p>
       </div>

       <div className="flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-20 w-full max-w-[1200px]">
           {/* Pricing Card - Dibuat lebih elegan */}
           <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-[#0a3d4d]/5 text-center w-full max-w-[380px] border border-gray-100 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#94cd28] to-[#29a343]"></div>
               <h4 className="text-gray-500 font-medium text-sm uppercase tracking-widest mb-4 mt-2">Mulai Dari</h4>
               
               <div className="flex items-start justify-center text-[#0a3d4d] my-4">
                   <span className="text-2xl font-bold mt-2 mr-1">Rp</span> 
                   <span className="text-6xl font-extrabold tracking-tighter">XX</span>
                   <span className="text-2xl font-bold mt-auto mb-2 ml-1">.xxx</span>
               </div>
               
               <p className="text-gray-400 font-medium mb-8">/ bulan</p>
               
               <Link href="/auth" className="inline-flex items-center justify-center bg-[#0a3d4d] text-white py-4 px-8 rounded-2xl font-bold text-lg w-full hover:bg-gradient-to-r hover:from-[#94cd28] hover:to-[#29a343] transition-all duration-300 shadow-lg shadow-transparent hover:shadow-[#29a343]/30 hover:-translate-y-1">
                   Daftar Sekarang
               </Link>
           </div>

           {/* Features Grid - Mengikuti layout gambar (2 kolom) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 lg:gap-x-12 text-left self-center w-full lg:flex-1 mt-8 lg:mt-0">
               {staticFeatures.map((item) => (
                   <div key={item.id} className="flex items-start gap-4 text-[#0a3d4d] group">
                       {/* Menggunakan ikon Lucide CheckCircle2 dengan warna gelap mirip di gambar */}
                       <CheckCircle2 
                         className="w-6 h-6 shrink-0 mt-0.5 text-[#023A4B] drop-shadow-sm transition-transform group-hover:scale-110" 
                         fill="#023A4B" 
                         stroke="white" 
                       />
                       <span className="font-semibold text-lg leading-tight pt-0.5 capitalize-first">
                         {item.title}
                       </span>
                   </div>
               ))}
           </div>
       </div>
    </section>
  );
}

// --- KOMPONEN FOOTER ---
function Footer() {
  return (
    <footer className="w-full bg-[#0a3d4d] text-white pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#94cd28] to-[#29a343]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#29a343] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="flex flex-col gap-6 lg:pr-8">
            <div className="flex items-center gap-2">
               <Image 
                 src="/images/logo.png" 
                 alt="Ke-Pin Logo" 
                 width={140} 
                 height={45} 
                 className="h-10 w-auto object-contain brightness-0 invert" 
               />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform manajemen keuangan cerdas berbasis AI untuk membantu bisnis Anda tumbuh lebih cepat, efisien, dan transparan.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#94cd28] hover:text-[#0a3d4d] hover:border-transparent transition-all">
                <Facebook size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Produk</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Fitur Utama</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Harga</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Integrasi API</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Studi Kasus</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Update Terbaru</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Perusahaan</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-[#94cd28] transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Hubungi Kami</h4>
            <ul className="flex flex-col gap-5 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0 mt-0.5">
                  <MapPin size={16} className="text-[#94cd28]" />
                </div>
                <span className="leading-relaxed">Jl. Teknologi No. 12, Samarinda, Kalimantan Timur, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  <Mail size={16} className="text-[#94cd28]" />
                </div>
                <a href="mailto:hello@ke-pin.id" className="hover:text-white transition-colors">hello@ke-pin.id</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  <Phone size={16} className="text-[#94cd28]" />
                </div>
                <a href="tel:+6281234567890" className="hover:text-white transition-colors">+62 812 3456 7890</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Ke-Pin. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
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