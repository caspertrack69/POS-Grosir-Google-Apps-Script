# GAS Backend Setup (GrosirKit)

## 1) Buat Script Properties
Set di `Project Settings > Script properties`:

- `SPREADSHEET_ID` = ID Google Sheet utama
- `API_TOKEN` = token rahasia untuk akses frontend
- `INVOICE_FOLDER_ID` (opsional) = folder Drive untuk PDF invoice
- `FONNTE_TOKEN` (opsional) = token API Fonnte untuk WhatsApp

## 2) Deploy Web App
1. `Deploy > New deployment`
2. Type: `Web app`
3. Execute as: `Me`
4. Who has access: `Anyone`
5. Simpan URL deploy

## 3) Hubungkan ke Frontend
Isi `.env` di root frontend:

```env
VITE_GAS_BASE_URL=<WEB_APP_URL>
VITE_GAS_TOKEN=<API_TOKEN>
```

Catatan: karena limitasi web app Apps Script, header `Authorization` tidak dapat diakses langsung di `doGet/doPost`, jadi frontend juga mengirim `token` di query/body.

## 4) Inisialisasi Sheet
Schema akan dibuat otomatis saat request pertama masuk.

Sheet yang dibuat:
- `Produk`
- `Mitra`
- `Tier_Config`
- `Transaksi`
- `Invoice`
- `Log_WA`
