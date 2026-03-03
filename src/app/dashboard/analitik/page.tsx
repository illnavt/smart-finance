import AnalitikClient from "./AnalitikClient";

export const metadata = {
  title: "Analitik AI - Ke-Pin",
  description: "Prediksi bisnis masa depan menggunakan simulasi Machine Learning",
};

export default function AnalitikPage() {
  // Halaman ini sengaja dibuat kosong karena proses pengambilan data
  // sepenuhnya dikendalikan oleh interaksi waktu (5, 10, 15 tahun) di Client Component.
  return <AnalitikClient />;
}