import { CircleMinus, CirclePlus, Trash2 } from "lucide-react";
import Card from "../ui/card";
import { formatRupiah } from "../../utils/formatRupiah";

function ProductCart({ lines, subtotal, totalDiscount, grandTotal, onQtyChange, onRemove }) {
  return (
    <Card title="Keranjang" description="Ringkasan item yang akan diproses.">
      <div className="space-y-2">
        {lines.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">Belum ada produk di keranjang.</p>
        ) : (
          lines.map((line) => (
            <article key={line.id_produk} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{line.nama_produk}</p>
                  <p className="text-xs text-slate-500">Harga dasar {formatRupiah(line.harga_dasar)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.id_produk)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                  aria-label={`Hapus ${line.nama_produk}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQtyChange(line.id_produk, Number(line.qty || 0) - 1)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500"
                    disabled={Number(line.qty || 0) <= 1}
                    aria-label={`Kurangi ${line.nama_produk}`}
                  >
                    <CircleMinus size={15} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-slate-800">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => onQtyChange(line.id_produk, Number(line.qty || 0) + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-600"
                    aria-label={`Tambah ${line.nama_produk}`}
                  >
                    <CirclePlus size={15} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-sm font-semibold text-slate-900">{formatRupiah(line.total)}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
        <p className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold">{formatRupiah(subtotal)}</span>
        </p>
        <p className="mt-1 flex justify-between text-slate-600">
          <span>Diskon tier</span>
          <span className="font-semibold">- {formatRupiah(totalDiscount)}</span>
        </p>
        <p className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatRupiah(grandTotal)}</span>
        </p>
      </div>
    </Card>
  );
}

export default ProductCart;
