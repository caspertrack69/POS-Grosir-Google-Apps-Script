import { useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button";
import Card from "../components/ui/card";
import useGAS from "../hooks/useGAS";
import { mockDashboard } from "../data/mockData";
import { formatRupiah } from "../utils/formatRupiah";

function MetricCard({ label, value, hint }) {
  return (
    <article className="surface-soft p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </article>
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
          return;
        }
      } catch {
        // fallback ke mock
      }

      setDashboard(mockDashboard);
      setUsingMock(true);
    };

    load();

    return () => controller.abort();
  }, [get]);

  const maxOmzet = useMemo(
    () => Math.max(1, ...dashboard.omzet_7_hari.map((item) => Number(item.omzet || 0))),
    [dashboard.omzet_7_hari],
  );

  return (
    <div className="space-y-4">
      <Card
        title="Ringkasan Hari Ini"
        description="Pantau omzet, transaksi, dan status operasional secara cepat."
        action={<Badge variant={usingMock ? "warning" : "success"}>{usingMock ? "Mock" : "Live"}</Badge>}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Omzet Hari Ini" value={formatRupiah(dashboard.omzet_hari_ini)} />
          <MetricCard label="Jumlah Transaksi" value={dashboard.jumlah_transaksi} />
          <MetricCard label="Mitra Aktif" value={dashboard.mitra_aktif} />
          <MetricCard label="Produk Terlaris" value={dashboard.produk_terlaris} />
          <MetricCard label="Invoice Belum Lunas" value={dashboard.invoice_belum_bayar} />
          <MetricCard label="Status API" value={loading ? "Memuat" : "Siap"} hint="Target respons < 5 detik" />
        </div>
      </Card>

      <Card title="Omzet 7 Hari" description="Tren penjualan mingguan.">
        <div className="grid grid-cols-7 gap-2">
          {dashboard.omzet_7_hari.map((item) => (
            <div key={item.tanggal} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-xl bg-slate-50 p-1.5">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${Math.max(10, Math.round((Number(item.omzet || 0) / maxOmzet) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{item.tanggal.slice(5)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Komunitas Pengguna" description="Tempat diskusi implementasi GrosirKit dan Google Apps Script.">
        <Button onClick={() => window.open("https://chat.whatsapp.com/HhXHuhvQtQYAnRtR8uCil5", "_blank", "noopener,noreferrer")}>
          Join Komunitas
        </Button>
      </Card>
    </div>
  );
}

export default Dashboard;
