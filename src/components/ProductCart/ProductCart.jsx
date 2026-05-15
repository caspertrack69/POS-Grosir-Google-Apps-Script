import Button from "../ui/button";
import Card from "../ui/card";
import Input from "../ui/input";
import { formatRupiah } from "../../utils/formatRupiah";

function ProductCart({ lines, subtotal, totalDiscount, grandTotal, onQtyChange, onRemove }) {
  return (
    <Card title="Keranjang" description="Keranjang tersimpan lokal, aman jika koneksi internet terputus sesaat.">
      <div className="space-y-3">
        {lines.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">Belum ada produk di keranjang.</p>
        ) : (
          lines.map((line) => (
            <article key={line.id_produk} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{line.nama_produk}</p>
                  <p className="text-xs text-slate-500">Harga dasar {formatRupiah(line.harga_dasar)}</p>
                  <p className="text-xs text-slate-500">Diskon tier {line.discountPercent}%</p>
                </div>
                <Button onClick={() => onRemove(line.id_produk)} variant="ghost">
                  Hapus
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Input
                  min={1}
                  type="number"
                  value={line.qty}
                  onChange={(event) => onQtyChange(line.id_produk, Number(event.target.value || 1))}
                />
                <div className="text-sm text-slate-600">
                  <p>Subtotal</p>
                  <p className="font-semibold text-slate-900">{formatRupiah(line.lineTotal)}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>Diskon</p>
                  <p className="font-semibold text-slate-900">{formatRupiah(line.discountValue)}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>Total</p>
                  <p className="font-semibold text-brand-700">{formatRupiah(line.total)}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 space-y-1 rounded-md bg-slate-50 p-3 text-sm">
        <p className="flex justify-between text-slate-700">
          <span>Total sebelum diskon</span>
          <span className="font-semibold">{formatRupiah(subtotal)}</span>
        </p>
        <p className="flex justify-between text-slate-700">
          <span>Diskon tier</span>
          <span className="font-semibold">- {formatRupiah(totalDiscount)}</span>
        </p>
        <p className="flex justify-between text-base font-bold text-slate-900">
          <span>Grand total</span>
          <span>{formatRupiah(grandTotal)}</span>
        </p>
      </div>
    </Card>
  );
}

export default ProductCart;
