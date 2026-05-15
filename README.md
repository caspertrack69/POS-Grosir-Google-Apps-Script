# GrosirKit MVP

POS Grosir/Mitra dengan Tiered Pricing (Harga Bertingkat) & Auto-Invoice, dengan Teknologi:

- Frontend: Vite + React + Tailwind
- Backend template: Google Apps Script (Web App + Google Sheets)

## Fitur yang sudah diimplementasikan

- Dashboard ringkasan transaksi (dengan fallback mock data)
- POS kasir dengan:
  - pencarian produk
  - keranjang transaksi
  - kalkulasi tiered pricing berbasis integer (hindari floating-point drift)
  - generate transaksi + invoice (live ke GAS atau fallback draft lokal)
- Manajemen Produk (list + tambah)
- Manajemen Mitra (list + tambah)
- Halaman Invoice (tracking + update status)
- CTA Komunitas GAS (`CommunityBanner`) dengan dismiss dan tampil kembali setelah 7 hari
- Template backend GAS endpoint `doGet/doPost` 
- Unit test untuk kalkulasi uang dan generator nomor dokumen

## Quick start (frontend)

1. Install dependency:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env
```

3. Isi `.env`:

```env
VITE_GAS_BASE_URL=<WEB_APP_URL_GAS>
VITE_GAS_TOKEN=<API_TOKEN>
```

4. Jalankan dev server:

```bash
npm run dev
```

5. Build production:

```bash
npm run build
```

6. Jalankan test:

```bash
npm test
```

## Setup backend Google Apps Script

Lihat panduan detail di:

- `gas/README.md`

File backend utama:

- `gas/Code.gs`

## Catatan keamanan

- Token API diverifikasi di backend melalui `Script Properties` (`API_TOKEN`).
- Karena limitasi Web App Apps Script, header `Authorization` tidak dapat dibaca langsung di event `doGet/doPost`; frontend juga mengirim token via query/body.


## Struktur folder

```
src/
  components/
  hooks/
  pages/
  utils/
  data/
  tests/
gas/
```

**👉 Join Komunitas WhatsApp GAS: https://chat.whatsapp.com/HhXHuhvQtQYAnRtR8uCil5**
