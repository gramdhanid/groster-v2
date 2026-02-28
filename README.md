# POS Warung PWA (Offline-First)

Sistem Point of Sale (POS) dan Manajemen Stok untuk warung kelontong/grosiran. Didesain untuk bekerja secara offline dengan performa tinggi pada perangkat berspesifikasi rendah, menggunakan teknologi Sinkronisasi Latar Belakang.

## 🚀 Fitur Utama

- **Offline-First**: Aplikasi tetap berfungsi 100% tanpa koneksi internet setelah muatan pertama.
- **Sinkronisasi Otomatis**: Transaksi offline akan otomatis tersinkronisasi ke server (Supabase) saat koneksi internet kembali.
- **Dukungan Barcode**: Pencarian cepat menggunakan barcode pada POS dan Manajemen Produk.
- **Manajemen Satuan & Harga**: Dukungan multi-satuan (Misal: Pcs, Dus, Karton) dengan konversi harga otomatis.
- **Hutang Piutang**: Pengelolaan pelanggan dengan buku hutang dan integrasi pengingat via WhatsApp.
- **Laporan & Dasbor**: Analisis penjualan dan metrik menggunakan grafik interaktif (uPlot).
- **Cetak Struk PDF**: Pembuatan struk PDF secara langsung dari server via Edge Functions.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Router
- **State & Data**: Zustand (Lokal), TanStack Query (Server), Dexie.js (IndexedDB)
- **Komponen**: shadcn/ui (Radix UI), lucide-react, react-number-format, date-fns, uPlot
- **Backend & Database**: Supabase (PostgreSQL), Supabase Edge Functions (Deno)

## 📦 Panduan Instalasi & Persiapan

### 1. Kloning dan Instalasi Dependencies
```bash
# Instal npm packages
npm install
```

### 2. Setup Database (Supabase)
1. Buat proyek baru di [Supabase](https://supabase.com).
2. Pergi ke menu **SQL Editor**.
3. Jalankan isi file migrasi yang berada di `supabase/migrations/0001_initial_schema.sql` untuk membuat tabel, index, dan trigger.

### 3. Setup Supabase Edge Functions
Pastikan Anda memiliki [Supabase CLI](https://supabase.com/docs/guides/cli) yang terinstal.
```bash
# Login ke akun Supabase
supabase login

# Deploy Edge Functions
supabase functions deploy sync-events
supabase functions deploy generate-pdf
```

### 4. Konfigurasi Environment Variables
1. Salin `.env.example` menjadi `.env`.
2. Masukkan kredensial proyek Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   ```

### 5. Jalankan Development Server
```bash
npm run dev
```

## 📱 Panduan PWA & Mode Offline

Aplikasi ini menggunakan `vite-plugin-pwa` untuk Service Worker. 
Untuk menguji mode offline secara penuh (seperti di Production):
```bash
npm run build
npm run preview
```
Buka DevTools Chrome -> tab Network -> Ubah ke "Offline" dan uji coba POS. Transaksi akan tersimpan di IndexedDB (`POSWarung`) dan mencoba menyinkronkannya saat kembali online.

## 📁 Struktur Proyek (Ringkasan)

- `/src/components` - Komponen UI, Layout, dan form.
- `/src/lib/db` - IndexedDB menggunakan Dexie.js dan SyncManager logika background sync (offline queues).
- `/src/lib/supabase.ts` - Koneksi klien Supabase.
- `/supabase/migrations/` - SQL Schema PostgreSQL.
- `/supabase/functions/` - Deno Edge Functions (Endpoint `/sync-events`, `/generate-pdf`). 

## 📝 Catatan Teknis

- **Grafik uPlot**: Perlu integrasi DOM useRef secara manual jika dibungkus komponen React, karena `uPlot` ditulis dalam Vanilla JS dengan footprint yang sangat kecil (<50KB), cocok untuk performa PWA.
- **Penyimpanan Lokal vs Akun Pengguna**: Data PWA terkait langsung dengan browser di perangkat yang menggunakan UUID. Reset cache akan menghilangkan data transaksi offline yang belum sinkron (!). Disarankan ada tombol manual Sinkronisasi.
