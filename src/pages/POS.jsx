import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import Select from "../components/ui/select";
import Badge from "../components/ui/badge";
import TierBadge from "../components/TierBadge/TierBadge";
import ProductCart from "../components/ProductCart/ProductCart";
import InvoicePreview from "../components/InvoicePreview/InvoicePreview";
import useGAS from "../hooks/useGAS";
import { calculateTierPricing, getTierConfigByLevel } from "../hooks/useTier";
import useInvoice from "../hooks/useInvoice";
import { mockMitra, mockProducts, mockTierConfig } from "../data/mockData";
import { generateNoInvoice, generateNoTransaksi } from "../utils/generateNoInvoice";
import { formatRupiah } from "../utils/formatRupiah";

const CART_STORAGE_KEY = "grosirkit_pos_cart";

function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function POS() {
  const { get, post, loading } = useGAS();
  const { activeInvoice, addInvoice } = useInvoice();

  const [products, setProducts] = useState(mockProducts);
  const [mitraList, setMitraList] = useState(mockMitra);
  const [tierConfig, setTierConfig] = useState(mockTierConfig);
  const [selectedMitraId, setSelectedMitraId] = useState("MTR-000");
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [cartItems, setCartItems] = useState(loadPersistedCart);
  const [status, setStatus] = useState({ tone: "", message: "" });
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      let fallback = false;

      try {
        const response = await get("getProduk", {}, { signal: controller.signal });
        if (Array.isArray(response?.data) && response.data.length > 0) {
          setProducts(response.data);
        } else {
          fallback = true;
          setProducts(mockProducts);
        }
      } catch {
        fallback = true;
        setProducts(mockProducts);
      }

      try {
        const response = await get("getMitraList", {}, { signal: controller.signal });
        if (Array.isArray(response?.data) && response.data.length > 0) {
          setMitraList(response.data);
        } else {
          fallback = true;
          setMitraList(mockMitra);
        }
      } catch {
        fallback = true;
        setMitraList(mockMitra);
      }

      try {
        const response = await get("getTierConfig", {}, { signal: controller.signal });
        if (Array.isArray(response?.data) && response.data.length > 0) {
          setTierConfig(response.data);
        } else {
          fallback = true;
          setTierConfig(mockTierConfig);
        }
      } catch {
        fallback = true;
        setTierConfig(mockTierConfig);
      }

      setUsingMock(fallback);
    };

    load();

    return () => controller.abort();
  }, [get]);

  const selectedMitra = useMemo(
    () => mitraList.find((mitra) => mitra.id_mitra === selectedMitraId) || mitraList[0] || mockMitra[2],
    [mitraList, selectedMitraId],
  );

  const pricing = useMemo(
    () => calculateTierPricing(cartItems, selectedMitra, tierConfig),
    [cartItems, selectedMitra, tierConfig],
  );

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products
      .filter((product) => product.aktif !== false)
      .filter((product) => {
        if (!keyword) {
          return true;
        }

        return (
          product.nama_produk.toLowerCase().includes(keyword) ||
          product.id_produk.toLowerCase().includes(keyword)
        );
      });
  }, [products, search]);

  const addProductToCart = (product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id_produk === product.id_produk);

      if (existing) {
        return current.map((item) =>
          item.id_produk === product.id_produk
            ? { ...item, qty: Math.max(1, Number(item.qty || 1) + 1) }
            : item,
        );
      }

      return [
        ...current,
        {
          id_produk: product.id_produk,
          nama_produk: product.nama_produk,
          harga_dasar: Number(product.harga_dasar || 0),
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (idProduk, qty) => {
    setCartItems((current) =>
      current.map((item) =>
        item.id_produk === idProduk
          ? {
              ...item,
              qty: Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1,
            }
          : item,
      ),
    );
  };

  const removeFromCart = (idProduk) => {
    setCartItems((current) => current.filter((item) => item.id_produk !== idProduk));
  };

  const checkout = async () => {
    if (cartItems.length === 0) {
      setStatus({ tone: "warning", message: "Keranjang masih kosong." });
      return;
    }

    const payload = {
      id_mitra: selectedMitra.id_mitra,
      metode_bayar: paymentMethod,
      status: "LUNAS",
      items: pricing.lines.map((line) => ({
        id_produk: line.id_produk,
        nama_produk: line.nama_produk,
        qty: line.qty,
        harga_dasar: line.harga_dasar,
        diskon_persen: line.discountPercent,
        subtotal: line.total,
      })),
      total_sebelum_diskon: pricing.subtotal,
      diskon_tier: pricing.totalDiscount,
      grand_total: pricing.grandTotal,
    };

    try {
      const response = await post("createTransaksi", payload);
      const invoiceData = {
        ...response.data,
        nama_mitra: selectedMitra.nama,
        grand_total: pricing.grandTotal,
      };

      addInvoice(invoiceData);
      setStatus({ tone: "success", message: `Invoice ${invoiceData.id_invoice} berhasil diproses.` });
      setCartItems([]);
    } catch {
      const fallbackInvoice = {
        id_transaksi: generateNoTransaksi(new Date(), Math.floor(Math.random() * 9999)),
        id_invoice: generateNoInvoice(new Date(), Math.floor(Math.random() * 9999)),
        drive_url: "",
        wa_status: "PENDING",
        status_wa: "PENDING",
        nama_mitra: selectedMitra.nama,
        grand_total: pricing.grandTotal,
      };

      addInvoice(fallbackInvoice);
      setStatus({
        tone: "warning",
        message: "Server GAS belum tersedia. Draft invoice lokal dibuat agar transaksi tidak hilang.",
      });
      setCartItems([]);
    }
  };

  const tierInfo = getTierConfigByLevel(tierConfig, selectedMitra.level_tier || 1);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <Card title="Point of Sale" description="Kasir mode cepat untuk transaksi grosir dan mitra.">
        <div className="grid gap-3 lg:grid-cols-4">
          <Select
            label="Pilih Mitra"
            value={selectedMitraId}
            onChange={(event) => setSelectedMitraId(event.target.value)}
            options={mitraList.map((mitra) => ({
              value: mitra.id_mitra,
              label: `${mitra.nama} (${mitra.id_mitra})`,
            }))}
          />
          <div className="flex flex-col justify-end">
            <p className="text-sm text-slate-600">Level aktif</p>
            <div className="mt-2">
              <TierBadge level={selectedMitra.level_tier || 1} />
            </div>
          </div>
          <div className="flex flex-col justify-end text-sm text-slate-600">
            <p>Diskon tier</p>
            <p className="mt-2 text-lg font-semibold text-brand-700">{Number(tierInfo.diskon_persen || 0)}%</p>
          </div>
          <Select
            label="Metode Bayar"
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            options={[
              { value: "Tunai", label: "Tunai" },
              { value: "Transfer", label: "Transfer" },
              { value: "QRIS", label: "QRIS" },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Daftar Produk" description="Cari produk, lalu klik untuk menambah ke keranjang.">
          <Input
            id="search-produk"
            label="Cari produk"
            placeholder="Nama produk atau SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {filteredProducts.map((product) => (
              <button
                className="rounded-md border border-slate-200 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
                key={product.id_produk}
                onClick={() => addProductToCart(product)}
                type="button"
              >
                <p className="text-xs text-slate-500">{product.id_produk}</p>
                <p className="text-sm font-semibold text-slate-900">{product.nama_produk}</p>
                <p className="mt-1 text-sm text-brand-700">{formatRupiah(product.harga_dasar)}</p>
                <p className="text-xs text-slate-500">Stok: {product.stok}</p>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <ProductCart
            grandTotal={pricing.grandTotal}
            lines={pricing.lines}
            onQtyChange={updateQty}
            onRemove={removeFromCart}
            subtotal={pricing.subtotal}
            totalDiscount={pricing.totalDiscount}
          />

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant={usingMock ? "warning" : "success"}>{usingMock ? "Mode mock data" : "Mode live data"}</Badge>
              <Button disabled={loading || cartItems.length === 0} onClick={checkout}>
                {loading ? "Memproses..." : "Selesai & Kirim Invoice"}
              </Button>
            </div>
            {status.message ? (
              <p
                className={[
                  "mt-3 text-sm",
                  status.tone === "success" ? "text-emerald-700" : "text-amber-700",
                ].join(" ")}
              >
                {status.message}
              </p>
            ) : null}
          </Card>

          <InvoicePreview invoice={activeInvoice} />
        </div>
      </div>
    </div>
  );
}

export default POS;
