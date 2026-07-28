# Panduan Deploy — Dari Nol Sampai Online

Panduan ini ditulis untuk kondisi Anda: **belum punya akun Supabase**, **sudah punya GitHub**,
**belum punya akun Vercel**. Ikuti urutan ini persis, jangan lompat bagian.

Total waktu: ±20–30 menit.

---

## Bagian 1 — Membuat Project Supabase

### 1.1 Daftar akun

1. Buka [supabase.com](https://supabase.com) → klik **Start your project**.
2. Daftar pakai akun GitHub Anda (paling cepat, tidak perlu password baru).

### 1.2 Buat project baru

1. Klik **New Project**.
2. Isi:
   - **Name**: `trip-savings-dashboard` (bebas)
   - **Database Password**: klik **Generate a password**, lalu **simpan password ini di tempat aman** (Notes app / password manager). Anda tidak akan butuh ini untuk aplikasi, tapi simpan untuk jaga-jaga.
   - **Region**: pilih yang terdekat, misalnya `Southeast Asia (Singapore)`.
3. Klik **Create new project**. Tunggu ±2 menit sampai project selesai di-provision.

### 1.3 Jalankan SQL migration

1. Di sidebar kiri project Anda, klik ikon **SQL Editor**.
2. Klik **New query**.
3. Buka file `supabase/migrations/0001_init.sql` dari project ini, **copy semua isinya**.
4. Paste ke SQL Editor, lalu klik **Run** (atau `Ctrl/Cmd + Enter`).
5. Harus muncul **"Success. No rows returned"**. Ini berarti tabel `payments`,
   `activity_logs`, `admin_settings`, storage bucket, dan semua kebijakan keamanan (RLS)
   sudah dibuat otomatis.

Kalau muncul error, kemungkinan besar ada bagian SQL yang ter-paste tidak lengkap — copy
ulang seluruh file dari awal sampai akhir.

### 1.4 Ganti PIN Admin default

Migration otomatis mengisi PIN Admin dengan `123456`. **Ganti sebelum dibagikan ke teman-teman.**

Di SQL Editor, jalankan query baru (ganti `654321` dengan PIN 6 digit pilihan Anda):

```sql
update public.admin_settings
set admin_pin = crypt('654321', gen_salt('bf'));
```

### 1.5 Ambil API credentials

1. Di sidebar kiri, klik ikon gerigi **Project Settings** → **API**.
2. Catat 3 nilai berikut (akan dipakai di Bagian 3):
   - **Project URL** → contoh: `https://slscdjobjwkeksntulxx.supabase.co/rest/v1/`
   - **anon / public key** → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2Nkam9iandrZWtzbnR1bHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxOTU4NjAsImV4cCI6MjEwMDc3MTg2MH0.G3fhyNJ30bB10jTeeMetQ4kVv4Lvm0sCSKSEQC5LpF0`
   - **service_role key** → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsc2Nkam9iandrZWtzbnR1bHh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE5NTg2MCwiZXhwIjoyMTAwNzcxODYwfQ.j28UlfnzkldIubeKVFgXjzQoo1ym9EXSY5z6JIMxSTo`
     ⚠️ **Key ini rahasia total** — jangan pernah taruh di kode frontend atau commit ke Git.

### 1.6 Verifikasi storage bucket

1. Di sidebar kiri, klik ikon **Storage**.
2. Pastikan ada bucket bernama **`payment-proofs`** dengan status **Public**. Migration di
   atas sudah membuatnya otomatis — langkah ini cuma untuk memastikan.

---

## Bagian 2 — Push Kode ke GitHub

Karena Anda sudah punya akun GitHub, tinggal buat repo baru dan push.

1. Buka [github.com/new](https://github.com/new).
2. **Repository name**: `trip-savings-dashboard` (atau nama lain).
3. Pilih **Private** (disarankan, supaya kode tidak publik) atau Public — terserah Anda.
4. **Jangan** centang "Add a README file" (project ini sudah punya).
5. Klik **Create repository**.

Di komputer Anda, buka terminal di folder project ini, lalu jalankan:

```bash
git init
git add .
git commit -m "Initial commit: Overseas Trip Savings Dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/trip-savings-dashboard.git
git push -u origin main
```

Ganti `USERNAME-ANDA` dengan username GitHub Anda. File `.env.local` **tidak akan ikut ter-push**
(sudah masuk `.gitignore`), jadi credential Supabase Anda aman.

---

## Bagian 3 — Deploy ke Vercel

### 3.1 Daftar akun Vercel

1. Buka [vercel.com/signup](https://vercel.com/signup).
2. Pilih **Continue with GitHub** dan otorisasi akses. Ini yang paling mudah karena langsung
   terhubung ke repo Anda, tidak perlu setup terpisah.

### 3.2 Import project

1. Di dashboard Vercel, klik **Add New...** → **Project**.
2. Cari repo `trip-savings-dashboard` yang baru saja Anda push, klik **Import**.
3. Vercel otomatis mendeteksi ini project Next.js — biarkan semua pengaturan default
   (Framework Preset: Next.js, Build Command: `next build`, dll).

### 3.3 Isi Environment Variables

Sebelum klik Deploy, buka bagian **Environment Variables** di halaman yang sama, tambahkan
3 baris ini (nilai dari langkah 1.5):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari Supabase |

Pastikan semua di-apply untuk environment **Production**, **Preview**, dan **Development**
(biasanya sudah tercentang semua secara default).

### 3.4 Deploy

Klik **Deploy**. Tunggu ±2 menit. Setelah selesai, Vercel memberi Anda URL seperti:

```
https://trip-savings-dashboard-xxxx.vercel.app
```

**Ini link yang Anda bagikan ke Fafa, Febi, Nadine, dan Marsya.** Karena tidak ada sistem
login, siapa pun yang membuka link ini langsung bisa memakai dashboard.

---

## Bagian 4 — Verifikasi Semua Berfungsi

Buka link Vercel Anda dan cek satu-satu:

- [ ] Dashboard tampil (hero, progress, 4 kartu anggota, timeline bulanan)
- [ ] Klik **Tambah** → isi form → **Tambah Pembayaran** → cek muncul di dashboard
- [ ] Coba upload bukti transfer (JPG/PNG/PDF)
- [ ] Buka **Riwayat** → transaksi tadi muncul → coba klik ikon edit/hapus → diminta PIN
      (masukkan PIN yang Anda set di langkah 1.4)
- [ ] Buka **Statistik** → 4 grafik tampil
- [ ] Klik **Export Excel** → file `.xlsx` terunduh dengan 5 sheet
- [ ] Coba dari HP (buka link yang sama) → tampilan responsif, bottom nav muncul
- [ ] Coba mode gelap (toggle ikon bulan/matahari di pojok kanan atas)

Kalau semua lolos, dashboard sudah siap dipakai bersama teman-teman.

---

## Troubleshooting

**Halaman blank / error saat load data**
Cek Vercel → Project → Settings → Environment Variables, pastikan 3 variable di atas terisi
persis (tanpa spasi tambahan), lalu klik **Deployments** → titik tiga pada deployment terakhir
→ **Redeploy**.

**"PIN Admin salah" padahal yakin benar**
PIN yang aktif adalah yang terakhir di-set lewat query `update admin_settings set admin_pin = crypt(...)`.
Jalankan lagi query di langkah 1.4 di SQL Editor Supabase untuk reset.

**Upload bukti transfer gagal**
Pastikan bucket `payment-proofs` ada dan berstatus Public (langkah 1.6). Kalau tidak ada,
jalankan ulang bagian storage dari `supabase/migrations/0001_init.sql`.

**Ingin custom domain (misal `tabungan-trip.com`)**
Di Vercel: Project → Settings → Domains → Add → ikuti instruksi untuk mengarahkan DNS domain
Anda. Tidak wajib — URL `.vercel.app` bawaan sudah bisa dipakai selamanya secara gratis.

**Update kode di kemudian hari**
Edit kode → `git add . && git commit -m "pesan"` → `git push`. Vercel otomatis build & deploy
ulang setiap kali ada push ke branch `main`.
