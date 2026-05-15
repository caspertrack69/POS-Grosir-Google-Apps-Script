import { useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import Select from "../components/ui/select";
import Table from "../components/ui/table";
import TierBadge from "../components/TierBadge/TierBadge";
import useGAS from "../hooks/useGAS";
import { mockMitra, mockTierConfig } from "../data/mockData";
import { formatRupiah } from "../utils/formatRupiah";

const initialForm = {
  id_mitra: "",
  nama: "",
  nomor_hp: "",
  alamat: "",
  level_tier: "1",
};

function Mitra() {
  const { get, post, loading } = useGAS();
  const [mitraList, setMitraList] = useState(mockMitra);
  const [tierConfig, setTierConfig] = useState(mockTierConfig);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const load = async () => {
      let fallback = false;

      try {
        const response = await get("getMitraList");
        if (Array.isArray(response?.data)) {
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
        const response = await get("getTierConfig");
        if (Array.isArray(response?.data)) {
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
  }, [get]);

  const columns = useMemo(
    () => [
      { key: "id_mitra", label: "ID" },
      { key: "nama", label: "Mitra" },
      { key: "nomor_hp", label: "No. HP" },
      {
        key: "level_tier",
        label: "Tier",
        render: (row) => <TierBadge level={Number(row.level_tier || 1)} />,
      },
      {
        key: "total_pembelian",
        label: "Total",
        render: (row) => formatRupiah(row.total_pembelian || 0),
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

    if (!form.id_mitra || !form.nama || !form.nomor_hp) {
      setStatus("ID mitra, nama, dan nomor HP wajib diisi.");
      return;
    }

    const payload = {
      ...form,
      level_tier: Number(form.level_tier),
      total_pembelian: 0,
      tanggal_daftar: new Date().toISOString().slice(0, 10),
    };

    try {
      await post("addMitra", payload);
      setStatus("Mitra berhasil ditambahkan ke server.");
    } catch {
      setStatus("Server belum tersedia, mitra disimpan lokal.");
    }

    setMitraList((current) => [payload, ...current.filter((item) => item.id_mitra !== payload.id_mitra)]);
    setForm(initialForm);
  };

  return (
    <div className="space-y-4">
      <Card
        title="Manajemen Mitra"
        description="Kelola data pelanggan dan tingkatan tier."
        action={<Badge variant={usingMock ? "warning" : "success"}>{usingMock ? "Mock" : "Live"}</Badge>}
      >
        <p className="text-sm text-slate-500">Jumlah mitra: {mitraList.length}</p>
      </Card>

      <Card title="Tambah Mitra Baru">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
          <Input id="id_mitra" label="ID Mitra" name="id_mitra" onChange={handleChange} value={form.id_mitra} />
          <Input id="nama" label="Nama Mitra" name="nama" onChange={handleChange} value={form.nama} />
          <Input id="nomor_hp" label="Nomor HP" name="nomor_hp" onChange={handleChange} value={form.nomor_hp} />
          <Input id="alamat" label="Alamat" name="alamat" onChange={handleChange} value={form.alamat} />
          <Select
            id="level_tier"
            label="Level Tier"
            name="level_tier"
            onChange={handleChange}
            options={tierConfig.map((tier) => ({
              value: String(tier.level),
              label: `${tier.nama_tier} (${tier.diskon_persen}%)`,
            }))}
            value={form.level_tier}
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <Button disabled={loading} type="submit">
              {loading ? "Menyimpan..." : "Simpan Mitra"}
            </Button>
          </div>
        </form>
        {status ? <p className="mt-3 text-sm text-slate-600">{status}</p> : null}
      </Card>

      <Card title="Daftar Mitra">
        <Table columns={columns} rows={mitraList} />
      </Card>
    </div>
  );
}

export default Mitra;
