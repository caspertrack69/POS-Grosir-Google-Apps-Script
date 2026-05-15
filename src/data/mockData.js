export const mockTierConfig = [
  { level: 1, nama_tier: "Umum", min_transaksi: 0, diskon_persen: 0 },
  { level: 2, nama_tier: "Mitra Perak", min_transaksi: 500000, diskon_persen: 5 },
  { level: 3, nama_tier: "Mitra Emas", min_transaksi: 2000000, diskon_persen: 10 },
  { level: 4, nama_tier: "Mitra Platinum", min_transaksi: 5000000, diskon_persen: 15 },
];

export const mockProducts = [
  {
    id_produk: "SKU-001",
    nama_produk: "Minyak Goreng 2L",
    kategori: "Sembako",
    harga_dasar: 28000,
    stok: 120,
    stok_minimum: 25,
    aktif: true,
  },
  {
    id_produk: "SKU-002",
    nama_produk: "Beras Premium 5kg",
    kategori: "Sembako",
    harga_dasar: 72000,
    stok: 80,
    stok_minimum: 20,
    aktif: true,
  },
  {
    id_produk: "SKU-003",
    nama_produk: "Susu Kental Manis",
    kategori: "FMCG",
    harga_dasar: 11500,
    stok: 200,
    stok_minimum: 40,
    aktif: true,
  },
];

export const mockMitra = [
  {
    id_mitra: "MTR-001",
    nama: "Toko Berkah",
    nomor_hp: "6281234567890",
    alamat: "Jl. Cempaka No. 2, Bandung",
    level_tier: 3,
    total_pembelian: 10650000,
    tanggal_daftar: "2026-01-10",
  },
  {
    id_mitra: "MTR-002",
    nama: "Warung Maju Jaya",
    nomor_hp: "6289876543210",
    alamat: "Jl. Sudirman No. 18, Cimahi",
    level_tier: 2,
    total_pembelian: 3220000,
    tanggal_daftar: "2026-02-14",
  },
  {
    id_mitra: "MTR-000",
    nama: "Pembeli Umum",
    nomor_hp: "-",
    alamat: "-",
    level_tier: 1,
    total_pembelian: 0,
    tanggal_daftar: "2026-01-01",
  },
];

export const mockInvoices = [
  {
    id_invoice: "INV-20260515-0042",
    id_transaksi: "TRX-20260515-0042",
    drive_url: "https://drive.google.com/file/d/example/view",
    tanggal_buat: "2026-05-15T09:45:00.000Z",
    status_wa: "TERKIRIM",
    status: "LUNAS",
    grand_total: 1260000,
    nama_mitra: "Toko Berkah",
  },
];

export const mockDashboard = {
  omzet_hari_ini: 4875000,
  jumlah_transaksi: 19,
  mitra_aktif: 8,
  produk_terlaris: "Minyak Goreng 2L",
  invoice_belum_bayar: 4,
  omzet_7_hari: [
    { tanggal: "2026-05-09", omzet: 3500000 },
    { tanggal: "2026-05-10", omzet: 4100000 },
    { tanggal: "2026-05-11", omzet: 3890000 },
    { tanggal: "2026-05-12", omzet: 4225000 },
    { tanggal: "2026-05-13", omzet: 4450000 },
    { tanggal: "2026-05-14", omzet: 4710000 },
    { tanggal: "2026-05-15", omzet: 4875000 },
  ],
};
