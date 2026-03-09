# POS Warung PWA (Offline-First)

Sistem Point of Sale (POS) dan Manajemen Stok untuk warung kelontong/grosiran. Didesain untuk bekerja secara offline dengan performa tinggi pada perangkat berspesifikasi rendah, menggunakan teknologi Sinkronisasi Latar Belakang.

## 🚀 Fitur Utama

### Core Features
- **Offline-First**: Aplikasi tetap berfungsi 100% tanpa koneksi internet setelah muatan pertama
- **Sinkronisasi Otomatis**: Transaksi offline akan otomatis tersinkronisasi ke server (Supabase) saat koneksi internet kembali
- **Dukungan Barcode**: Pencarian cepat menggunakan barcode pada POS dan Manajemen Produk dengan @zxing/library
- **Manajemen Satuan & Harga**: Dukungan multi-satuan (Pcs, Dus, Karton) dengan konversi harga otomatis
- **Hutang Piutang**: Pengelolaan pelanggan dengan buku hutang dan integrasi pengingat via WhatsApp
- **Cetak Struk PDF**: Pembuatan struk PDF secara langsung dari server via Edge Functions

### Dashboard & Analytics
- **Dashboard Komprehensif**: Grafik pendapatan, metrik penjualan, dan insight stok
- **SalesTrendChart**: Grafik tren penjualan dengan uPlot, format angka Indonesia, tooltip interaktif
- **Time Filter**: Filter waktu untuk produk terlaris
- **Low Stock Alerts**: Tabel stok rendah dengan layout kartu yang mudah dibaca

### Product Management
- **Filter Produk**: Filter kategori, rentang harga, dan stok dengan filter chips
- **Product Detail Modal**: Lihat detail produk lengkap
- **Unit Selector**: Pilih satuan kustom dengan mudah
- **Swipe-to-Delete**: Hapus produk dengan gesture swipe pada kartu produk
- **Expand/Collapse**: Tampilkan/sembunyikan satuan untuk produk dengan multiple satuan

### Restock & Cashflow
- **Restock Flow**: Alur restock lengkap dengan modal supplier
- **Cashflow Tracking**: Pelacakan arus kas masuk/keluar

## 📱 UI/UX & Accessibility

### Mobile-First Design
Aplikasi dioptimalkan untuk perangkat mobile dengan gesture dan interaksi modern:

| Fitur | Deskripsi |
|-------|-----------|
| **Swipe-to-Dismiss** | Tutup modal dengan gesture swipe ke bawah |
| **Swipe-to-Delete** | Hapus item dengan gesture swipe ke kiri |
| **Bottom Sheet Modals** | Modal yang muncul dari bawah pada mobile |
| **Touch Targets** | Minimum 44px untuk kemudahan sentuh |
| **Android Back Button** | Dukungan tombol back native |

### Accessibility Standards
- **Font Size**: Minimum 12px untuk keterbacaan lansia
- **Section Headers**: Header dengan ikon untuk navigasi visual
- **Confirm Dialogs**: Dialog konfirmasi kustom (pengganti native confirm)
- **Scroll Lock**: Mencegah scroll body saat modal terbuka

### Component Architecture
```
BottomSheetModal
├── useSwipeToDismiss (gesture handling)
├── useScrollLock (body scroll prevention)
├── useModalBackButton (Android back)
└── ModalPortal (React portal)

ConfirmDialog
└── Pengganti window.confirm() dengan lebih banyak opsi
```

### Modal Components
- `ProductModal` - Tambah/edit produk dengan BottomSheetModal
- `StockAdjustmentModal` - Penyesuaian stok dengan UI visual
- `RestockModal` - Alur restock dengan filter kategori
- `UnitSelectorModal` - Pilih satuan kustom
- `ProductDetailModal` - Lihat detail produk

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui (Radix UI)
- **Icons**: lucide-react
- **Routing**: React Router
- **Number Formatting**: react-number-format
- **Date Handling**: date-fns

### State & Data
- **Local State**: Zustand (cart, UI state)
- **Server State**: TanStack Query
- **Local Storage**: Dexie.js (IndexedDB)

### Charts & Visualization
- **uPlot**: Grafik interaktif dengan footprint kecil (<50KB)

### Barcode Scanner
- **@zxing/library**: Barcode/QR code scanning
- **Native Barcode API**: Dukungan browser native
- **Torch Control**: Kontrol flash/kamera pada Android

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Deno (sync-events, generate-pdf)

### Development Tools
- **Code Formatting**: Prettier
- **Type Safety**: TypeScript strict mode

## 📦 Panduan Instalasi & Persiapan

### 1. Kloning dan Instalasi Dependencies
```bash
# Install npm packages
npm install
```

### 2. Setup Database (Supabase)
1. Buat proyek baru di [Supabase](https://supabase.com)
2. Pergi ke menu **SQL Editor**
3. Jalankan isi file migrasi di `supabase/migrations/0001_initial_schema.sql` untuk membuat tabel, index, dan trigger

### 3. Setup Supabase Edge Functions
Pastikan Anda memiliki [Supabase CLI](https://supabase.com/docs/guides/cli) yang terinstal:
```bash
# Login ke akun Supabase
supabase login

# Deploy Edge Functions
supabase functions deploy sync-events
supabase functions deploy generate-pdf
```

### 4. Konfigurasi Environment Variables
1. Salin `.env.example` menjadi `.env`
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

Buka DevTools Chrome → tab Network → Ubah ke "Offline" dan uji coba POS. Transaksi akan tersimpan di IndexedDB (`POSWarung`) dan mencoba menyinkronkannya saat kembali online.

## 📁 Struktur Proyek

```
/src
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── BottomSheetModal   # Bottom sheet dengan swipe-to-dismiss
│   │   ├── ConfirmDialog      # Custom confirm dialog
│   │   ├── ModalPortal        # React portal untuk modals
│   │   └── Select             # shadcn Select component
│   ├── pos/                   # POS-related components
│   ├── products/              # Product management components
│   ├── dashboard/             # Dashboard & charts
│   └── ...
├── hooks/
│   ├── useSwipeToDismiss.ts   # Swipe gesture hook
│   ├── useScrollLock.ts       # Body scroll lock
│   ├── useModalBackButton.ts  # Android back button
│   └── useKeyboardHeight.ts   # Keyboard height handling
├── lib/
│   ├── db/                    # IndexedDB dengan Dexie.js
│   │   └── SyncManager        # Background sync logic
│   └── supabase.ts            # Koneksi klien Supabase
└── store/
    └── useCartStore.ts        # Cart state management

/supabase
├── migrations/                # SQL Schema PostgreSQL
└── functions/                 # Deno Edge Functions
    ├── sync-events            # Sync offline transactions
    └── generate-pdf           # Receipt PDF generation
```

## 📝 Catatan Teknis

### uPlot Grafik
Perlu integrasi DOM useRef secara manual jika dibungkus komponen React, karena `uPlot` ditulis dalam Vanilla JS dengan footprint yang sangat kecil (<50KB), cocok untuk performa PWA.

### Penyimpanan Lokal
Data PWA terkait langsung dengan browser di perangkat yang menggunakan UUID. Reset cache akan menghilangkan data transaksi offline yang belum sinkron (!). Disarankan ada tombol manual Sinkronisasi.

### Swipe Gestures
- **useSwipeToDismiss**: Hook untuk gesture swipe ke bawah
- Mendukung touch dan mouse events
- Threshold konfigurasi (default: 150px)
- Smart detection: body hanya bisa drag saat scroll di posisi atas
- Header handlers: selalu bisa drag regardless of scroll position

### Modal Patterns
Semua modal baru harus menggunakan `BottomSheetModal` untuk konsistensi:
1. Impor `BottomSheetModal` dari `@/components/ui/BottomSheetModal`
2. Gunakan `primaryButton` dan `secondaryButton` untuk aksi
3. Footer otomatis ter-generate dari props
4. Swipe-to-dismiss otomatis tersedia
5. Back button Android otomatis tertangani

## 🔄 Update Terakhir

**Maret 2026**:
- ✅ Prettier code formatting
- ✅ Shadcn Select component untuk kategori
- ✅ StockAdjustmentModal accessibility improvements
- ✅ Modal position reset fix
- ✅ Focus positioning improvements
- ✅ Swipe-to-dismiss gestures
- ✅ BottomSheetModal component system
- ✅ Barcode scanner with torch control
- ✅ Dashboard dengan grafik uPlot
- ✅ Product filter modal
- ✅ Restock flow dengan supplier modal
- ✅ Cashflow tracking
- ✅ Confirm dialog untuk perubahan belum disimpan
