"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { LogOut, AlertCircle, Plus } from "lucide-react";
import { uploadTransactionFile } from "@/app/actions/upload";
import { logoutAction } from "@/app/actions/auth-actions";

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg("");
    const allowedExtensions = /(\.xls|\.xlsx|\.csv)$/i;
    if (!allowedExtensions.exec(file.name)) {
      setErrorMsg("Format tidak didukung! Gunakan .xlsx, .xls, atau .csv");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("File terlalu besar (Maks 5MB).");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        await uploadTransactionFile(formData);
        window.location.reload();
      } catch (error: any) {
        console.error(error);
        setErrorMsg(error.message || "Gagal mengunggah file.");
      }
    });
  };

  const onButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-linear-to-br from-[#e8f7ec] via-[#f2fdf5] to-[#d1f5de]">
      <div className="absolute top-8 right-8 z-50">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 bg-white/60 backdrop-blur-md text-gray-600 hover:text-red-600 font-bold px-6 py-3 rounded-full shadow-sm hover:shadow-lg hover:bg-white hover:scale-105 cursor-pointer transition-all duration-300 border border-white/40 active:scale-95"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </form>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="w-full max-w-4xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] p-10 md:p-20 flex flex-col items-center relative">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-[#0a3d4d] tracking-tight">
              Upload File{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#29a343] to-[#94cd28]">
                Keuangan
              </span>
            </h1>
            <p className="text-[#3d5a64] font-semibold text-lg md:text-xl opacity-80">
              Format yang didukung: .xlsx, .xls, .csv
            </p>
          </div>

          {errorMsg && (
            <div className="mb-8 w-full max-w-xl p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          <div
            className={`
              w-full h-[400px] rounded-[2.5rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group shadow-[inset_0_0_40px_rgba(255,255,255,0.5)]
              ${
                isDragging
                  ? "bg-white/90 border-[#29a343] scale-[1.02] shadow-2xl"
                  : "border-[#29a343]/20 bg-white/30 hover:bg-white/60 hover:border-[#29a343]/50"
              }
              ${isPending ? "opacity-60 cursor-wait pointer-events-none" : ""} 
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />

            {isPending ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#29a343] border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="font-black text-[#0a3d4d] text-2xl animate-pulse">
                  Menganalisis Data...
                </p>
              </div>
            ) : (
              <>
                <div className="bg-linear-to-r from-[#94cd28] to-[#29a343] text-white rounded-3xl p-6 shadow-[0_15px_35px_rgba(41,163,67,0.3)] mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Plus size={48} strokeWidth={3} />
                </div>
                <h3 className="text-[#0a3d4d] font-black text-2xl md:text-3xl mb-2">
                  Klik atau Tarik File
                </h3>
                <p className="text-[#3d5a64] font-medium text-lg">
                  Mulai analisis pintar Ke-Pin sekarang
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
