import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_dummy_excel(filename="data_dummy_kepin.xlsx"):
    print("Mulai meng-generate data dummy...")

    # --- SETUP TANGGAL ---
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)
    days_between = (end_date - start_date).days

    # ==========================================
    # 1. GENERATE DATA TRANSAKSI (500 Baris)
    # ==========================================
    barang_list = [
        {"nama": "Kopi Susu Gula Aren", "harga": 25000},
        {"nama": "Americano", "harga": 20000},
        {"nama": "Croissant Butter", "harga": 30000},
        {"nama": "Matcha Latte", "harga": 28000},
        {"nama": "Choco Brownie", "harga": 35000}
    ]
    
    transaksi_data = []
    for i in range(1, 501):
        tgl = start_date + timedelta(days=random.randint(0, days_between))
        barang = random.choice(barang_list)
        qty = random.randint(1, 5)
        
        transaksi_data.append({
            "ID Transaksi": f"TRX-{i:04d}",
            "Tanggal": tgl.strftime("%d/%m/%Y"),
            "Waktu": f"{random.randint(8, 21):02d}:{random.randint(0, 59):02d}",
            "ID Pelanggan": f"CUST-{random.randint(1, 50):03d}", # 50 pelanggan unik untuk tes Retensi
            "Nama Pelanggan": f"Pelanggan {random.randint(1, 50)}",
            "Nama Barang": barang["nama"],
            "Kuantitas (Qty)": qty,
            "Harga Satuan": barang["harga"],
            "Total Harga": qty * barang["harga"],
            "Status": random.choices(["Berhasil", "Gagal"], weights=[90, 10])[0] # 90% berhasil
        })
    df_trx = pd.DataFrame(transaksi_data)

    # ==========================================
    # 2. GENERATE DATA KEUANGAN / ARUS KAS (100 Baris)
    # ==========================================
    kategori_pengeluaran = ["Operasional", "Gaji Karyawan", "Marketing/Iklan", "Sewa Tempat", "Listrik & Air"]
    keuangan_data = []
    
    for i in range(1, 101):
        tgl = start_date + timedelta(days=random.randint(0, days_between))
        tipe = random.choices(["Pemasukan", "Pengeluaran"], weights=[20, 80])[0] # Banyakan pengeluaran (pemasukan utama dari TRX)
        
        if tipe == "Pengeluaran":
            kat = random.choice(kategori_pengeluaran)
            nominal = random.randint(500000, 5000000)
        else:
            kat = "Suntikan Dana / Lainnya"
            nominal = random.randint(1000000, 10000000)

        keuangan_data.append({
            "ID Pencatatan": f"KAS-{i:03d}",
            "Tanggal": tgl.strftime("%d/%m/%Y"),
            "Tipe Kas": tipe,
            "Kategori": kat,
            "Keterangan": f"{tipe} untuk {kat}",
            "Nominal": nominal
        })
    df_keu = pd.DataFrame(keuangan_data)

    # ==========================================
    # 3. GENERATE DATA STOK BARANG
    # ==========================================
    stok_data = []
    for idx, barang in enumerate(barang_list):
        stok_awal = random.randint(100, 500)
        stok_masuk = random.randint(50, 200)
        
        # Hitung stok keluar dari data transaksi yang kita buat di atas
        stok_keluar = df_trx[(df_trx["Nama Barang"] == barang["nama"]) & (df_trx["Status"] == "Berhasil")]["Kuantitas (Qty)"].sum()
        
        # Simulasi ada barang yang stoknya mau habis (kurang dari 10)
        if idx == 0: 
            stok_awal = stok_keluar + 5
            stok_masuk = 0
            
        sisa_stok = stok_awal + stok_masuk - stok_keluar
        
        stok_data.append({
            "Kode Barang": f"BRG-{idx+1:03d}",
            "Nama Barang": barang["nama"],
            "Kategori Barang": "Makanan/Minuman",
            "Stok Awal": stok_awal,
            "Stok Masuk": stok_masuk,
            "Stok Keluar": stok_keluar,
            "Sisa Stok": sisa_stok,
            "Harga Beli Pokok (HPP)": int(barang["harga"] * 0.4) # Margin 60%
        })
    df_stok = pd.DataFrame(stok_data)

    # ==========================================
    # EXPORT KE EXCEL (Beda Sheet)
    # ==========================================
    print("Menyimpan ke file Excel...")
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df_trx.to_excel(writer, sheet_name='Transaksi', index=False)
        df_keu.to_excel(writer, sheet_name='Keuangan', index=False)
        df_stok.to_excel(writer, sheet_name='Stok_Barang', index=False)
        
    print(f"✅ Selesai! File '{filename}' berhasil dibuat.")

if __name__ == "__main__":
    generate_dummy_excel()