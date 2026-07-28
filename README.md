# ✈️ Overseas Trip Savings Dashboard

Dashboard tabungan liburan bersama untuk **Fafa, Febi, Nadine, dan Marsya** — tanpa login,
tanpa akun, siapa pun yang punya link bisa membuka dan menambah transaksi.

**Panduan deploy lengkap (dari nol, langkah demi langkah) ada di [`DEPLOYMENT.md`](./DEPLOYMENT.md).**
Baca file itu dulu kalau tujuannya adalah membuat dashboard ini online.

---

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** + komponen ala shadcn/ui (ditulis manual di `components/ui/`)
- **Supabase** (Postgres + Storage + Realtime) sebagai backend
- **Recharts** untuk grafik, **Framer Motion** untuk animasi, **react-confetti** untuk perayaan
- **ExcelJS** untuk export `.xlsx` dengan format profesional
- Deploy target: **Vercel**

## Struktur Folder

```
app/                  Halaman (App Router) & API routes
  page.tsx            Dashboard (halaman utama)
  add/                Halaman Tambah Transaksi
  history/            Halaman Riwayat Transaksi
  statistics/         Halaman Statistik
  api/admin/          Route PIN-protected (edit/delete via service role)
  api/export/         Route generate file Excel
components/
  ui/                 Primitif UI (button, card, dialog, dst — gaya shadcn)
  layout/             Navbar, ThemeProvider, ThemeToggle
  dashboard/          Komponen khusus halaman dashboard
  transactions/       Form tambah, upload bukti, tabel riwayat, dialog PIN
  statistics/         4 komponen grafik Recharts
  shared/             Komponen lintas halaman (empty state, skeleton, dll)
hooks/                useSavingsData (data + realtime), useWindowSize
lib/
  supabase/           Client browser (anon key) & client admin (service role, server-only)
  utils.ts            Helper format Rupiah, tanggal Indonesia, dll
services/              Semua query Supabase dipisah dari UI (payments, activity, storage)
types/                Tipe TypeScript bersama
constants/             Anggota, target, aturan bulan — sumber tunggal kebenaran
utils/calculations.ts  Perhitungan progress, status bulanan, achievement
supabase/migrations/   SQL schema lengkap (jalankan di Supabase SQL Editor)
```

## Instalasi Lokal

**Prasyarat:** Node.js 20+ dan sudah membuat project Supabase (lihat `DEPLOYMENT.md` bagian 1
jika belum punya).

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan URL & key dari project Supabase Anda
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode development |
| `npm run build` | Build production (juga menjalankan type-check) |
| `npm run start` | Jalankan hasil build production secara lokal |
| `npm run lint` | Jalankan ESLint |

## Keamanan PIN Admin

PIN Admin **tidak pernah disimpan sebagai teks biasa** — di-hash dengan bcrypt di database
(lihat `supabase/migrations/0001_init.sql`). Proses edit/hapus transaksi hanya bisa lewat
Next.js Route Handler (`app/api/admin/**`) yang berjalan di server menggunakan
`SUPABASE_SERVICE_ROLE_KEY`. Row Level Security memastikan anon key (yang dipakai browser)
sama sekali **tidak bisa** melakukan UPDATE/DELETE pada tabel `payments`, apalagi membaca
tabel `admin_settings` — jadi PIN tidak bisa "diintip" lewat DevTools sekalipun.

PIN default setelah migration adalah **`123456`**. Ganti segera — caranya ada di `DEPLOYMENT.md`.

## Catatan Desain / Asumsi

PRD tidak menentukan formula numerik pasti untuk status individu (🟢/🟡/🔴), jadi diambil
pendekatan: dibandingkan dengan pace minimum (jumlah bulan berjalan × Rp500.000), dengan
toleransi. Bisa disesuaikan di `utils/calculations.ts` fungsi `getIndividualStatus`.

Data anggota, target, dan periode program (Mei 2026 – Des 2027) adalah konstanta di kode
(`constants/members.ts`, `constants/savings.ts`), bukan baris di database — karena nilainya
memang tetap sepanjang program ini berjalan. Ini yang membuat "seed data" tidak perlu skrip
terpisah; PIN Admin sudah otomatis di-seed oleh SQL migration.
