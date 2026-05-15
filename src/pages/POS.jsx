import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CircleMinus,
  CirclePlus,
  Coffee,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import useGAS from "../hooks/useGAS";
import { calculateTierPricing, getTierConfigByLevel } from "../hooks/useTier";
import useInvoice from "../hooks/useInvoice";
import { mockMitra, mockProducts, mockTierConfig } from "../data/mockData";
import { generateNoInvoice, generateNoTransaksi } from "../utils/generateNoInvoice";
import { formatRupiah } from "../utils/formatRupiah";

const CART_STORAGE_KEY = "grosirkit_pos_cart";

const quickFilters = [
  { key: "favorite", label: "Favorite", icon: Star },
  { key: "drink", label: "Hot Drink", icon: Coffee },
  { key: "food", label: "Food", icon: Package },
  { key: "other", label: "Soft Drink", icon: ShoppingBag },
];

const defaultFavoriteIds = ["SKU-001", "SKU-002", "SKU-003"];

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

function mapProductFilter(product) {
  const category = String(product.kategori || "").toLowerCase();
  const name = String(product.nama_produk || "").toLowerCase();

  if (category.includes("sembako") || /(beras|minyak|gula|telur|mie)/.test(name)) {
    return "food";
  }

  if (category.includes("fmcg") || /(kopi|susu|teh|minum|drink)/.test(name)) {
    return "drink";
  }

  return "other";
}

function getInitials(productName = "") {
  const words = productName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "PR";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function isFavoriteProduct(product, index) {
  if (product.favorite === true) {
    return true;
  }

  if (defaultFavoriteIds.includes(product.id_produk)) {
    return true;
  }

  return index < 3;
}

function POS() {
  const { get, post, loading } = useGAS();
  const { addInvoice } = useInvoice();

  const [products, setProducts] = useState(mockProducts);
  const [mitraList, setMitraList] = useState(mockMitra);
  const [tierConfig, setTierConfig] = useState(mockTierConfig);
  const [selectedMitraId, setSelectedMitraId] = useState("MTR-000");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("favorite");
  const [cartItems, setCartItems] = useState(loadPersistedCart);
  const [status, setStatus] = useState({ tone: "", message: "" });
  const [usingMock, setUsingMock] = useState(false);
  const [showQuickConfig, setShowQuickConfig] = useState(false);

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

  const cartQtyMap = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        acc[item.id_produk] = Number(item.qty || 0);
        return acc;
      }, {}),
    [cartItems],
  );

  const totalItems = useMemo(
    () => pricing.lines.reduce((acc, line) => acc + Number(line.qty || 0), 0),
    [pricing.lines],
  );

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products
      .filter((product) => product.aktif !== false)
      .filter((product, index) => {
        if (activeFilter === "favorite") {
          return isFavoriteProduct(product, index);
        }
        return mapProductFilter(product) === activeFilter;
      })
      .filter((product) => {
        if (!keyword) {
          return true;
        }

        return (
          String(product.nama_produk || "").toLowerCase().includes(keyword) ||
          String(product.id_produk || "").toLowerCase().includes(keyword) ||
          String(product.kategori || "").toLowerCase().includes(keyword)
        );
      });
  }, [products, activeFilter, search]);

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
    const normalized = Number.isFinite(qty) ? Math.floor(qty) : 0;

    setCartItems((current) => {
      if (normalized <= 0) {
        return current.filter((item) => item.id_produk !== idProduk);
      }

      return current.map((item) =>
        item.id_produk === idProduk
          ? {
              ...item,
              qty: Math.max(1, normalized),
            }
          : item,
      );
    });
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
    <div className="app-screen space-y-3 px-3 pb-36 pt-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm font-semibold text-slate-900">{selectedMitra.nama}</p>
            <p className="text-[11px] text-slate-500">
              {tierInfo.nama_tier} | {usingMock ? "Mock" : "Live"}
            </p>
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100"
            onClick={() => setShowQuickConfig((open) => !open)}
            aria-expanded={showQuickConfig}
            aria-label="Pengaturan cepat"
          >
            <Settings size={17} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Menu"
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600"
            onClick={() => setShowQuickConfig((open) => !open)}
            aria-label="Filter"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {showQuickConfig ? (
          <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <label className="text-xs text-slate-600">
              Mitra
              <select
                value={selectedMitraId}
                onChange={(event) => setSelectedMitraId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none"
              >
                {mitraList.map((mitra) => (
                  <option key={mitra.id_mitra} value={mitra.id_mitra}>
                    {mitra.nama}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-600">
              Metode Bayar
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none"
              >
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
                <option value="QRIS">QRIS</option>
              </select>
            </label>
          </div>
        ) : null}
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        <article className="min-w-[164px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-600">Ready To Serve</p>
          <p className="text-[11px] text-slate-400">#{String(2140 + totalItems).padStart(4, "0")}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{selectedMitra.nama}</p>
          <p className="text-xs text-slate-500">{Math.max(1, totalItems)} items</p>
        </article>
        <article className="min-w-[164px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] font-semibold text-amber-600">Being Cooked</p>
          <p className="text-[11px] text-slate-400">#{String(2141 + totalItems).padStart(4, "0")}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{paymentMethod}</p>
          <p className="text-xs text-slate-500">Diskon {Number(tierInfo.diskon_persen || 0)}%</p>
        </article>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={[
                "min-w-[88px] flex-none rounded-2xl border p-2 text-center",
                isActive ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <span
                className={[
                  "mx-auto grid h-7 w-7 place-items-center rounded-full",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                <Icon size={14} />
              </span>
              <span className="mt-1 block text-[11px] font-medium text-slate-700">{filter.label}</span>
            </button>
          );
        })}
      </section>

      <section className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">
            Menu tidak ditemukan.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const qtyInCart = cartQtyMap[product.id_produk] || 0;

            return (
              <article
                key={product.id_produk}
                className={[
                  "rounded-2xl border bg-white p-2.5 shadow-sm transition",
                  qtyInCart > 0 ? "border-brand-300" : "border-slate-200",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => addProductToCart(product)}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700"
                    aria-label={`Pilih ${product.nama_produk}`}
                  >
                    {getInitials(product.nama_produk)}
                  </button>

                  <button
                    type="button"
                    onClick={() => addProductToCart(product)}
                    className="min-w-0 flex-1 text-left"
                    aria-label={`Tambah ${product.nama_produk}`}
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">{product.nama_produk}</p>
                    <p className="text-sm font-semibold text-slate-900">{formatRupiah(product.harga_dasar)}</p>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQty(product.id_produk, qtyInCart - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Kurangi ${product.nama_produk}`}
                      disabled={qtyInCart === 0}
                    >
                      <CircleMinus size={15} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-slate-800">{qtyInCart}</span>
                    <button
                      type="button"
                      onClick={() => addProductToCart(product)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-600"
                      aria-label={`Tambah ${product.nama_produk}`}
                    >
                      <CirclePlus size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {status.message ? (
        <p
          className={[
            "rounded-2xl px-3 py-2 text-xs",
            status.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          {status.message}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-20 px-3">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-brand-600 p-1 shadow-lg shadow-brand-900/20">
          <button
            type="button"
            disabled={loading || cartItems.length === 0}
            onClick={checkout}
            className="flex w-full items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="text-sm font-semibold">{loading ? "Memproses..." : "Proceed New Order"}</span>
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span>
                {totalItems} items {formatRupiah(pricing.grandTotal)}
              </span>
              <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
