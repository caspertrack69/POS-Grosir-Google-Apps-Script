import Badge from "../ui/badge";
import Button from "../ui/button";
import Card from "../ui/card";
import { formatRupiah } from "../../utils/formatRupiah";

function InvoicePreview({ invoice }) {
  if (!invoice) {
    return (
      <Card title="Pratinjau Invoice" description="Invoice terakhir akan muncul di sini.">
        <p className="text-sm text-slate-500">Belum ada invoice yang diproses.</p>
      </Card>
    );
  }

  return (
    <Card title="Pratinjau Invoice" description="Pastikan data invoice benar sebelum dibagikan.">
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-900">{invoice.id_invoice}</p>
          <Badge variant={invoice.status_wa === "TERKIRIM" ? "success" : "warning"}>{invoice.status_wa || "PENDING"}</Badge>
        </div>
        <p className="text-slate-600">Transaksi: {invoice.id_transaksi || "-"}</p>
        <p className="text-slate-600">Mitra: {invoice.nama_mitra || "-"}</p>
        <p className="font-semibold text-brand-700">Grand total: {formatRupiah(invoice.grand_total || 0)}</p>
        {invoice.drive_url ? (
          <Button onClick={() => window.open(invoice.drive_url, "_blank", "noopener,noreferrer")} size="sm">
            Buka PDF Invoice
          </Button>
        ) : (
          <p className="text-xs text-slate-500">Link PDF belum tersedia.</p>
        )}
      </div>
    </Card>
  );
}

export default InvoicePreview;
