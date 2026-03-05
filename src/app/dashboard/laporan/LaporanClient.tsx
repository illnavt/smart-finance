"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Wallet,
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import {
  createCashFlowAction,
  updateCashFlowAction,
  deleteCashFlowAction,
  bulkDeleteCashFlowAction,
} from "@/app/actions/dashboard";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
};

export default function LaporanClient({ initialData }: { initialData: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    tipe: "Pengeluaran",
    kategori: "",
    keterangan: "",
    nominal: 0,
    tanggal: new Date().toISOString().split("T")[0],
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    data: any;
  }>({
    isOpen: false,
    type: "single",
    data: null,
  });

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
  }, [search, filterTipe]);

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const matchTipe = filterTipe === "Semua" || item.tipe === filterTipe;
      const searchLower = search.toLowerCase();
      const matchSearch =
        (item.kategori || "").toLowerCase().includes(searchLower) ||
        (item.keterangan || "").toLowerCase().includes(searchLower);
      return matchTipe && matchSearch;
    });
  }, [initialData, search, filterTipe]);

  const totalPemasukan = filteredData
    .filter((i) => i.tipe === "Pemasukan")
    .reduce((sum, i) => sum + (i.nominal || 0), 0);
  const totalPengeluaran = filteredData
    .filter((i) => i.tipe === "Pengeluaran")
    .reduce((sum, i) => sum + (i.nominal || 0), 0);
  const saldoBersih = totalPemasukan - totalPengeluaran;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getVisiblePages = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedItems(currentItems.map((i) => i.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) setSelectedItems((prev) => [...prev, id]);
    else setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: "",
      tipe: "Pengeluaran",
      kategori: "",
      keterangan: "",
      nominal: 0,
      tanggal: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setIsEditMode(true);
    const formattedDate = new Date(item.tanggal).toISOString().split("T")[0];
    setFormData({
      id: item.id,
      tipe: item.tipe,
      kategori: item.kategori,
      keterangan: item.keterangan || "",
      nominal: item.nominal,
      tanggal: formattedDate,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kategori || formData.nominal <= 0)
      return showToast("Lengkapi data dengan benar!", "error");

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateCashFlowAction(formData.id, formData);
        showToast("Catatan keuangan berhasil diperbarui!");
      } else {
        await createCashFlowAction(formData);
        showToast("Catatan keuangan berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error.message || "Terjadi kesalahan!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      if (deleteModal.type === "single") {
        await deleteCashFlowAction(deleteModal.data);
        setSelectedItems((prev) =>
          prev.filter((id) => id !== deleteModal.data),
        );
        showToast("Satu catatan berhasil dihapus.");
      } else if (deleteModal.type === "bulk") {
        await bulkDeleteCashFlowAction(selectedItems);
        showToast(`${selectedItems.length} catatan berhasil dihapus.`);
        setSelectedItems([]);
      }
    } catch (error: any) {
      showToast("Gagal menghapus data.", "error");
    } finally {
      setDeleteModal({ isOpen: false, type: "single", data: null });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a3d4d] tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Pantau arus kas, pemasukan, dan pengeluaran operasional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={() =>
                setDeleteModal({ isOpen: true, type: "bulk", data: null })
              }
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm animate-in fade-in zoom-in"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">
                Hapus ({selectedItems.length})
              </span>
            </button>
          )}

          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            className="bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-2xl font-bold transition-all shadow-sm outline-none focus:ring-2 focus:ring-[#29a343]/50 cursor-pointer"
          >
            <option value="Semua">Semua Arus Kas</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-[#29a343] to-[#238a39] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-[#29a343]/20 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Catat Transaksi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Pemasukan
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {formatRupiah(totalPemasukan)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingDown size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Pengeluaran
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {formatRupiah(totalPengeluaran)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Saldo Bersih
            </p>
            <h3
              className={`text-2xl font-black mt-1 ${saldoBersih < 0 ? "text-red-500" : "text-[#0a3d4d]"}`}
            >
              {formatRupiah(saldoBersih)}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 md:px-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-[#0a3d4d]">Riwayat Arus Kas</h2>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori / keterangan..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#29a343] rounded border-gray-300 focus:ring-[#29a343] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Tipe
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Kategori & Keterangan
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Tanggal
                </th>
                <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  Nominal
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText size={48} className="opacity-20" />
                      <p className="font-medium">
                        Tidak ada data keuangan yang ditemukan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => {
                  const isChecked = selectedItems.includes(item.id);
                  const isPemasukan = item.tipe === "Pemasukan";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/50 transition-colors group ${isChecked ? "bg-emerald-50/30" : ""}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleSelectItem(item.id, e.target.checked)
                          }
                          className="w-4 h-4 text-[#29a343] rounded border-gray-300 focus:ring-[#29a343] cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${isPemasukan ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}`}
                        >
                          {isPemasukan ? (
                            <ArrowUpRight size={14} strokeWidth={3} />
                          ) : (
                            <ArrowDownRight size={14} strokeWidth={3} />
                          )}
                          {item.tipe}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-[#0a3d4d] text-sm truncate max-w-[250px]">
                          {item.kategori}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-[250px]">
                          {item.keterangan || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                          {mounted ? formatDate(item.tanggal) : "..."}
                        </p>
                      </td>

                      <td className="py-4 px-8 text-right">
                        <p
                          className={`text-sm font-black ${isPemasukan ? "text-emerald-600" : "text-[#0a3d4d]"}`}
                        >
                          {isPemasukan ? "+" : "-"}
                          {formatRupiah(item.nominal)}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: "single",
                                data: item.id,
                              })
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium hidden sm:block">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 mr-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {getVisiblePages().map((page, i) => (
                <button
                  key={i}
                  onClick={() =>
                    typeof page === "number" ? setCurrentPage(page) : null
                  }
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === currentPage ? "bg-[#0a3d4d] text-white" : page === "..." ? "text-gray-400 cursor-default" : "text-gray-500 hover:bg-gray-100"}`}
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 ml-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-[#0a3d4d]">
                {isEditMode ? "Edit Catatan" : "Tambah Catatan Kas"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tipe Arus Kas <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.tipe}
                    onChange={(e) =>
                      setFormData({ ...formData, tipe: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none cursor-pointer"
                  >
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Pemasukan">Pemasukan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  placeholder="Contoh: Sewa Tempat, Gaji Karyawan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.nominal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nominal: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Masukkan jumlah..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none font-bold text-[#0a3d4d]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Keterangan Tambahan{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Rincian pembayaran..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#29a343] hover:bg-[#238a39] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 mt-2"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0a3d4d] mb-2">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {deleteModal.type === "bulk"
                  ? `Anda akan menghapus ${selectedItems.length} catatan keuangan secara permanen.`
                  : "Anda akan menghapus catatan ini secara permanen."}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, type: "single", data: null })
                }
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold border ${toastMessage.type === "success" ? "bg-white text-[#0a3d4d] border-emerald-100 shadow-emerald-900/10" : "bg-red-50 text-red-600 border-red-100 shadow-red-900/10"}`}
          >
            {toastMessage.type === "success" ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <X size={20} strokeWidth={3} />
              </div>
            )}
            {toastMessage.text}
          </div>
        </div>
      )}
    </div>
  );
}
