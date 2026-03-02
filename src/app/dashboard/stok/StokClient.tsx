"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Package, Search, Download, Box, TrendingUp, Wallet, 
  ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2, CheckCircle2 
} from "lucide-react";
import { 
  createProductAction, 
  updateProductAction, 
  deleteProductAction, 
  bulkDeleteProductAction,
  addStockAction // <-- Import fungsi baru
} from "@/app/actions/dashboard";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
};

export default function StokClient({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // ==== STATE SELEKSI ====
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // ==== STATE MODAL FORM UTAMA ====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", stok: 0, hpp: 0, price: 0 });

  // ==== STATE MODAL HAPUS KUSTOM ====
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: "single" | "bulk"; data: any }>({
    isOpen: false, type: "single", data: null
  });

  // ==== STATE MODAL TAMBAH STOK CEPAT ====
  const [quickAddModal, setQuickAddModal] = useState({ isOpen: false, id: "", name: "", currentStok: 0, amountToAdd: 1 });
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // ==== STATE TOAST ====
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => { 
    setCurrentPage(1);
    setSelectedItems([]); 
  }, [search]);

  // ==== LOGIKA FILTER ====
  const filteredData = useMemo(() => {
    return initialProducts.filter((product) => 
      (product.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [initialProducts, search]);

  // ==== KALKULASI RINGKASAN ASET ====
  const totalItemFisik = filteredData.reduce((sum, p) => sum + (p.stok || 0), 0);
  const totalNilaiAset = filteredData.reduce((sum, p) => sum + ((p.hpp || 0) * (p.stok || 0)), 0);
  const totalPotensiPendapatan = filteredData.reduce((sum, p) => sum + ((p.price || 0) * (p.stok || 0)), 0);

  // ==== LOGIKA PAGINATION ====
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // ==== CHECKBOX HANDLER ====
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedItems(currentItems.map(p => p.id));
    else setSelectedItems([]);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) setSelectedItems(prev => [...prev, id]);
    else setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const isAllSelected = currentItems.length > 0 && selectedItems.length === currentItems.length;

  // ==== ACTION HANDLERS (FORM UTAMA) ====
  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ id: "", name: "", stok: 0, hpp: 0, price: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setIsEditMode(true);
    setFormData({ id: p.id, name: p.name, stok: p.stok, hpp: p.hpp || 0, price: p.price || 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return showToast("Nama barang wajib diisi!", "error");
    
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateProductAction(formData.id, formData);
        showToast("Barang berhasil diperbarui!");
      } else {
        await createProductAction(formData);
        showToast("Barang baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error.message || "Terjadi kesalahan!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==== HANDLER TAMBAH STOK CEPAT ====
  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddModal.amountToAdd <= 0) return showToast("Jumlah harus lebih dari 0", "error");

    setIsQuickAdding(true);
    try {
      await addStockAction(quickAddModal.id, quickAddModal.amountToAdd);
      showToast(`Berhasil menambah ${quickAddModal.amountToAdd} stok untuk ${quickAddModal.name}`);
      setQuickAddModal({ isOpen: false, id: "", name: "", currentStok: 0, amountToAdd: 1 });
    } catch (error: any) {
      showToast("Gagal menambah stok: " + error.message, "error");
    } finally {
      setIsQuickAdding(false);
    }
  };

  // ==== ACTION HANDLERS (DELETE) ====
  const executeDelete = async () => {
    try {
      if (deleteModal.type === "single") {
        await deleteProductAction(deleteModal.data);
        setSelectedItems(prev => prev.filter(id => id !== deleteModal.data));
        showToast("Satu barang berhasil dihapus.");
      } else if (deleteModal.type === "bulk") {
        await bulkDeleteProductAction(selectedItems);
        showToast(`${selectedItems.length} barang berhasil dihapus.`);
        setSelectedItems([]);
      }
    } catch (error: any) {
      showToast("Gagal menghapus data. Barang mungkin sedang digunakan di riwayat transaksi.", "error");
    } finally {
      setDeleteModal({ isOpen: false, type: "single", data: null });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0a3d4d] tracking-tight">Stok Barang</h1>
          <p className="text-gray-500 font-medium mt-1">Kelola inventaris gudang, harga modal, dan harga jual.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button 
              onClick={() => setDeleteModal({ isOpen: true, type: "bulk", data: null })}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm animate-in fade-in zoom-in"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Hapus ({selectedItems.length})</span>
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
            <span className="hidden sm:inline">Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* KARTU RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center"><Box size={28} strokeWidth={2.5} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fisik Barang</p><h3 className="text-2xl font-black text-[#0a3d4d] mt-1">{totalItemFisik} <span className="text-sm text-gray-400">Pcs</span></h3></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Wallet size={28} strokeWidth={2.5} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nilai Aset (HPP)</p><h3 className="text-2xl font-black text-[#0a3d4d] mt-1">{formatRupiah(totalNilaiAset)}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={28} strokeWidth={2.5} /></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Potensi Pendapatan</p><h3 className="text-2xl font-black text-[#0a3d4d] mt-1">{formatRupiah(totalPotensiPendapatan)}</h3></div>
        </div>
      </div>

      {/* TABEL STOK MODERN */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 md:px-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-[#0a3d4d]">Daftar Barang</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama barang..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] transition-all outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 w-10 text-center">
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="w-4 h-4 text-[#29a343] rounded border-gray-300 focus:ring-[#29a343] cursor-pointer" />
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Barang</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Sisa Stok</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Modal (HPP)</th>
                <th className="py-4 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Harga Jual</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <p className="font-medium">Tidak ada barang yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((p) => {
                  const isChecked = selectedItems.includes(p.id);
                  return (
                  <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors group ${isChecked ? "bg-emerald-50/30" : ""}`}>
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" checked={isChecked} onChange={(e) => handleSelectItem(p.id, e.target.checked)} className="w-4 h-4 text-[#29a343] rounded border-gray-300 focus:ring-[#29a343] cursor-pointer" />
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#0a3d4d] text-sm truncate max-w-[200px]">{p.name}</p>
                    </td>
                    
                    {/* BAGIAN STOK DENGAN TOMBOL TAMBAH CEPAT */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${p.stok <= 5 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                          {p.stok}
                        </span>
                        <button 
                          onClick={() => setQuickAddModal({ isOpen: true, id: p.id, name: p.name, currentStok: p.stok, amountToAdd: 1 })}
                          className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100 shadow-sm"
                          title="Tambah Stok Cepat"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right"><p className="text-sm text-gray-500 font-medium">{formatRupiah(p.hpp)}</p></td>
                    <td className="py-4 px-8 text-right"><p className="text-sm font-black text-[#0a3d4d]">{formatRupiah(p.price)}</p></td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={18} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, type: "single", data: p.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PINTAR */}
        {filteredData.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium hidden sm:block">
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 mr-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
              {getVisiblePages().map((page, i) => (
                <button key={i} onClick={() => typeof page === "number" ? setCurrentPage(page) : null} className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === currentPage ? "bg-[#0a3d4d] text-white" : page === "..." ? "text-gray-400 cursor-default" : "text-gray-500 hover:bg-gray-100"}`} disabled={page === "..."}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 ml-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* ==== MODAL TAMBAH STOK CEPAT ==== */}
      {quickAddModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-emerald-100">
            <div className="bg-emerald-50/50 p-6 text-center border-b border-emerald-100 relative">
              <button onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false })} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 bg-white rounded-full transition-colors shadow-sm"><X size={16} strokeWidth={3} /></button>
              <div className="w-16 h-16 bg-white shadow-md text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-[#0a3d4d]">Tambah Stok</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">{quickAddModal.name}</p>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="p-6">
              <div className="flex justify-between text-sm font-bold text-gray-500 mb-4 px-2">
                <span>Stok Saat Ini:</span>
                <span className="text-[#0a3d4d]">{quickAddModal.currentStok} Pcs</span>
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-6">
                <button type="button" onClick={() => setQuickAddModal({...quickAddModal, amountToAdd: Math.max(1, quickAddModal.amountToAdd - 1)})} className="px-5 py-4 text-gray-500 hover:bg-gray-200 font-black text-lg transition-colors">-</button>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  value={quickAddModal.amountToAdd} 
                  onChange={(e) => setQuickAddModal({...quickAddModal, amountToAdd: parseInt(e.target.value) || 1})} 
                  className="w-full bg-transparent text-center font-black text-2xl text-[#29a343] focus:outline-none" 
                />
                <button type="button" onClick={() => setQuickAddModal({...quickAddModal, amountToAdd: quickAddModal.amountToAdd + 1})} className="px-5 py-4 text-gray-500 hover:bg-gray-200 font-black text-lg transition-colors">+</button>
              </div>

              <button type="submit" disabled={isQuickAdding} className="w-full bg-[#29a343] hover:bg-[#238a39] text-white py-4 rounded-xl font-black shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center">
                {isQuickAdding ? "Memproses..." : "Tambahkan Sekarang"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==== MODAL FORM UTAMA (TAMBAH / EDIT BARANG) ==== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[40] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-[#0a3d4d]">{isEditMode ? "Edit Barang" : "Tambah Barang"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={20} strokeWidth={3} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Barang <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Kopi Susu Gula Aren" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sisa Stok <span className="text-red-500">*</span></label>
                <input required type="number" min="0" value={formData.stok} onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Modal (HPP) <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" value={formData.hpp} onChange={(e) => setFormData({...formData, hpp: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual <span className="text-red-500">*</span></label>
                  <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#29a343]/30 focus:border-[#29a343] outline-none" />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-emerald-800">Margin Keuntungan:</span>
                <span className="text-lg font-black text-emerald-600">{formatRupiah(Math.max(0, formData.price - formData.hpp))} / Pcs</span>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#29a343] hover:bg-[#238a39] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 mt-2">
                {isSubmitting ? "Menyimpan..." : "Simpan Barang"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==== POP-UP MODAL KONFIRMASI HAPUS ==== */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 bg-[#0a3d4d]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><Trash2 size={36} strokeWidth={2.5} /></div>
            <div>
              <h3 className="text-xl font-black text-[#0a3d4d] mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{deleteModal.type === "bulk" ? `Anda akan menghapus ${selectedItems.length} barang secara permanen.` : "Anda akan menghapus barang ini secara permanen."}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModal({ isOpen: false, type: "single", data: null })} className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={executeDelete} className="flex-1 px-4 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ==== NOTIFIKASI TOAST ==== */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold border ${toastMessage.type === "success" ? "bg-white text-[#0a3d4d] border-emerald-100 shadow-emerald-900/10" : "bg-red-50 text-red-600 border-red-100 shadow-red-900/10"}`}>
            {toastMessage.type === "success" ? <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={20} strokeWidth={3} /></div> : <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><X size={20} strokeWidth={3} /></div>}
            {toastMessage.text}
          </div>
        </div>
      )}
    </div>
  );
}