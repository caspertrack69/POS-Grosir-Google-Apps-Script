import { useEffect, useState } from "react";
import Card from "../components/ui/card";
import Badge from "../components/ui/badge";
import useGAS from "../hooks/useGAS";
import { formatRupiah } from "../utils/formatRupiah";
import { mockDashboard } from "../data/mockData";

function Widget({ label, value, hint }) {
  return (
    <Card>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}

function Dashboard() {
  const { get, loading } = useGAS();
  const [dashboard, setDashboard] = useState(mockDashboard);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await get("getDashboard", {}, { signal: controller.signal });
        if (response?.data) {
          setDashboard(response.data);
          setUsingMock(false);
        }
      } catch {
        setDashboard(mockDashboard);
        setUsingMock(true);
      }
    };

    load();

    return () => controller.abort();
  }, [get]);

  const maxOmzet = Math.max(...dashboard.omzet_7_hari.map((item) => item.omzet));

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <Card title="Dashboard Real-Time" description="Ringkasan performa transaksi harian dari Google Sheets.">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">Status data</p>
          <Badge variant={usingMock ? "warning" : "success"}>{usingMock ? "Mock data" : "Live data"}</Badge>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Widget label="Total Omzet Hari Ini" value={formatRupiah(dashboard.omzet_hari_ini)} />
        <Widget label="Jumlah Transaksi" value={dashboard.jumlah_transaksi} />
        <Widget label="Mitra Aktif Hari Ini" value={dashboard.mitra_aktif} />
        <Widget label="Produk Terlaris" value={dashboard.produk_terlaris} />
        <Widget label="Invoice Belum Terbayar" value={dashboard.invoice_belum_bayar} />
        <Widget label="Response Status" value={loading ? "Loading" : "Siap"} hint="Target API < 5 detik" />
      </section>

      <Card title="Grafik Omzet 7 Hari" description="Visual cepat performa penjualan minggu terakhir.">
        <div className="grid grid-cols-7 gap-2">
          {dashboard.omzet_7_hari.map((item) => (
            <div className="flex flex-col items-center gap-2" key={item.tanggal}>
              <div className="flex h-36 w-full items-end justify-center rounded-md bg-slate-50 p-2">
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${Math.max(8, Math.round((item.omzet / maxOmzet) * 100))}%` }}
                />
              </div>
              <p className="text-center text-[11px] text-slate-500">{item.tanggal.slice(5)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Komunitas" description="Dukungan implementasi dan debug Google Apps Script.">
        <a
          className="inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
          href="https://chat.whatsapp.com/HhXHuhvQtQYAnRtR8uCil5"
          rel="noreferrer"
          target="_blank"
        >
          Join Komunitas
        </a>
      </Card>
    </div>
  );
}

export default Dashboard;
