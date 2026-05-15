import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/card";
import Table from "../components/ui/table";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import Badge from "../components/ui/badge";
import useGAS from "../hooks/useGAS";
import { mockProducts } from "../data/mockData";
import { formatRupiah } from "../utils/formatRupiah";

const initialForm = {
  id_produk: "",
  nama_produk: "",
  kategori: "",
  harga_dasar: "",
  stok: "",
  stok_minimum: "",
};

function Produk() {
  const { get, post, loading } = useGAS();
  const [products, setProducts] = useState(mockProducts);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await get("getProduk");
        if (Array.isArray(response?.data)) {
          setProducts(response.data);
          setUsingMock(false);
          return;
        }
      } catch {
        setUsingMock(true);
      }

      setProducts(mockProducts);
      setUsingMock(true);
    };

    load();
  }, [get]);

  const columns = useMemo(
    () => [
      { key: "id_produk", label: "SKU" },
      { key: "nama_produk", label: "Produk" },
      { key: "kategori", label: "Kategori" },
      {
        key: "harga_dasar",
        label: "Harga Dasar",
        render: (row) => formatRupiah(row.harga_dasar),
      },
      {
        key: "stok",
        label: "Stok",
        render: (row) => (
          <span className={Number(row.stok) <= Number(row.stok_minimum) ? "font-semibold text-rose-700" : "text-slate-700"}>
            {row.stok}
          </span>
        ),
      },
    ],
    [],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.id_produk || !form.nama_produk || !form.harga_dasar) {
      setStatus("SKU, nama produk, dan harga dasar wajib diisi.");
      return;
    }

    const payload = {
      ...form,
      harga_dasar: Number(form.harga_dasar),
      stok: Number(form.stok || 0),
      stok_minimum: Number(form.stok_minimum || 0),
      aktif: true,
    };

    try {
      await post("addProduk", payload);
      setStatus("Produk berhasil ditambahkan ke server.");
    } catch {
      setStatus("Server belum tersedia, produk disimpan lokal.");
    }

    setProducts((current) => [payload, ...current.filter((item) => item.id_produk !== payload.id_produk)]);
    setForm(initialForm);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <Card title="Manajemen Produk" description="Kelola SKU, harga dasar, kategori, dan stok minimum.">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">Produk aktif: {products.length}</p>
          <Badge variant={usingMock ? "warning" : "success"}>{usingMock ? "Mock data" : "Live data"}</Badge>
        </div>
      </Card>

      <Card title="Tambah Produk">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
          <Input id="id_produk" label="SKU" name="id_produk" onChange={handleChange} value={form.id_produk} />
          <Input id="nama_produk" label="Nama Produk" name="nama_produk" onChange={handleChange} value={form.nama_produk} />
          <Input id="kategori" label="Kategori" name="kategori" onChange={handleChange} value={form.kategori} />
          <Input
            id="harga_dasar"
            label="Harga Dasar"
            min={0}
            name="harga_dasar"
            onChange={handleChange}
            type="number"
            value={form.harga_dasar}
          />
          <Input id="stok" label="Stok" min={0} name="stok" onChange={handleChange} type="number" value={form.stok} />
          <Input
            id="stok_minimum"
            label="Stok Minimum"
            min={0}
            name="stok_minimum"
            onChange={handleChange}
            type="number"
            value={form.stok_minimum}
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <Button disabled={loading} type="submit">
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </div>
        </form>
        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </Card>

      <Card title="Daftar Produk">
        <Table columns={columns} rows={products} />
      </Card>
    </div>
  );
}

export default Produk;
