"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Search,
  Download,
  Wallet,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
  bulkDeleteTransactionAction,
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export default function TransaksiClient({
  initialTransactions,
  products,
}: {
  initialTransactions: any[];
  products: any[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [selectedItems, setSelectedItems] = useState<
    { id: string; productId: string; amount: number }[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customerName: "",
    productId: "",
    amount: 1,
  });
  const [oldData, setOldData] = useState({ productId: "", amount: 1 });

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
  }, [search]);

  const filteredData = useMemo(() => {
    return initialTransactions.filter((trx) => {
      const searchLower = search.toLowerCase();
      return (
        (trx.customerName || "").toLowerCase().includes(searchLower) ||
        (trx.product?.name || "").toLowerCase().includes(searchLower)
      );
    });
  }, [initialTransactions, search]);

  const totalPendapatan = filteredData.reduce(
    (sum, t) => sum + (t.totalPrice || 0),
    0,
  );
  const totalTransaksi = filteredData.length;
  const rataRataTransaksi =
    totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;

  const totalPages = Math.ceil(totalTransaksi / itemsPerPage);
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
    if (e.target.checked) {
      const allCurrent = currentItems.map((trx) => ({
        id: trx.id,
        productId: trx.idProduct,
        amount: trx.amount,
      }));
      setSelectedItems(allCurrent);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (trx: any, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [
        ...prev,
        { id: trx.id, productId: trx.idProduct, amount: trx.amount },
      ]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item.id !== trx.id));
    }
  };

  const isAllSelected =
    currentItems.length > 0 && selectedItems.length === currentItems.length;

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: "", customerName: "", productId: "", amount: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (trx: any) => {
    setIsEditMode(true);
    setFormData({
      id: trx.id,
      customerName: trx.customerName || "",
      productId: trx.idProduct,
      amount: trx.amount,
    });
    setOldData({ productId: trx.idProduct, amount: trx.amount });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId)
      return showToast("Pilih barang terlebih dahulu!", "error");

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateTransactionAction(formData.id, formData, oldData);
        showToast("Transaksi berhasil diperbarui!");
      } else {
        await createTransactionAction(formData);
        showToast("Transaksi baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error.message || "Terjadi kesalahan!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSingleDelete = (
    id: string,
    productId: string,
    amount: number,
  ) => {
    setDeleteModal({
      isOpen: true,
      type: "single",
      data: { id, productId, amount },
    });
  };

  const confirmBulkDelete = () => {
    setDeleteModal({ isOpen: true, type: "bulk", data: null });
  };

  const executeDelete = async () => {
    try {
      if (deleteModal.type === "single") {
        await deleteTransactionAction(
          deleteModal.data.id,
          deleteModal.data.productId,
          deleteModal.data.amount,
        );
        setSelectedItems((prev) =>
          prev.filter((item) => item.id !== deleteModal.data.id),
        );
        showToast("Satu transaksi berhasil dihapus.");
      } else if (deleteModal.type === "bulk") {
        await bulkDeleteTransactionAction(selectedItems);
        showToast(`${selectedItems.length} transaksi berhasil dihapus.`);
        setSelectedItems([]);
      }
    } catch (error: any) {
      showToast("Gagal menghapus data: " + error.message, "error");
    } finally {
      setDeleteModal({ isOpen: false, type: "single", data: null });
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const estimatedTotal = selectedProduct
    ? selectedProduct.price * formData.amount
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a3d4d] tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Pantau semua aktivitas penjualan dan arus kas masuk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={confirmBulkDelete}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm animate-in fade-in zoom-in"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">
                Hapus ({selectedItems.length})
              </span>
            </button>
          )}

          <button className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm hover:bg-gray-50">
            <Download size={18} />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-[#29a343] to-[#238a39] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-[#29a343]/20 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden sm:inline">Tambah Transaksi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Pendapatan
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {formatRupiah(totalPendapatan)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Transaksi
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {totalTransaksi}{" "}
              <span className="text-sm text-gray-400">Pesanan</span>
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Rata-rata Pesanan
            </p>
            <h3 className="text-2xl font-black text-[#0a3d4d] mt-1">
              {formatRupiah(rataRataTransaksi)}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 md:px-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-[#0a3d4d]">Semua Transaksi</h2>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelanggan / produk..."
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
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Info Produk
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Pelanggan
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Waktu (Terbaru)
                </th>
                <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  Total Nominal
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
                    <p className="font-medium">
                      Tidak ada transaksi yang sesuai.
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((trx) => {
                  const isChecked = selectedItems.some(
                    (item) => item.id === trx.id,
                  );
                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-gray-50/50 transition-colors group ${isChecked ? "bg-emerald-50/30" : ""}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleSelectItem(trx, e.target.checked)
                          }
                          className="w-4 h-4 text-[#29a343] rounded border-gray-300 focus:ring-[#29a343] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-[#0a3d4d] text-sm truncate max-w-[200px]">
                            {trx.product?.name || "Produk Dihapus"}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            Qty: {trx.amount}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-semibold text-gray-700">
                          {trx.customerName || "Umum"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                          {mounted ? formatDate(trx.created_at) : "..."}
                        </p>
                      </td>
                      <td className="py-4 px-8 text-right">
                        <p className="text-sm font-black text-[#0a3d4d]">
                          {formatRupiah(trx.totalPrice || 0)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(trx)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              confirmSingleDelete(
                                trx.id,
                                trx.idProduct,
                                trx.amount,
                              )
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
              {Math.min(currentPage * itemsPerPage, totalTransaksi)} dari{" "}
              {totalTransaksi}
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

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
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
                  ? `Anda akan menghapus ${selectedItems.length} transaksi secara permanen.`
                  : "Anda akan menghapus transaksi ini secara permanen."}
                <br />
                Stok barang akan dikembalikan ke gudang secara otomatis.
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
            className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold border ${
              toastMessage.type === "success"
                ? "bg-white text-[#0a3d4d] border-emerald-100 shadow-emerald-900/10"
                : "bg-red-50 text-red-600 border-red-100 shadow-red-900/10"
            }`}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-[#0a3d4d]">
                {isEditMode ? "Edit Transaksi" : "Tambah Transaksi"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nama Pelanggan{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pilih Produk <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    -- Pilih Barang --
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Sisa Stok: {p.stok}) - {formatRupiah(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kuantitas <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        amount: Math.max(1, formData.amount - 1),
                      })
                    }
                    className="px-4 py-3 text-gray-500 hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-transparent text-center font-bold text-[#0a3d4d] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, amount: formData.amount + 1 })
                    }
                    className="px-4 py-3 text-gray-500 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800">
                  Total Tagihan:
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {formatRupiah(estimatedTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#29a343] hover:bg-[#238a39] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : isEditMode
                    ? "Simpan Perubahan"
                    : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
