import { useMemo, useState } from "react";
import Badge from "../components/ui/badge";
import Button from "../components/ui/button";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import InvoicePreview from "../components/InvoicePreview/InvoicePreview";
import Select from "../components/ui/select";
import Table from "../components/ui/table";
import useInvoice from "../hooks/useInvoice";
import useGAS from "../hooks/useGAS";
import { mockInvoices } from "../data/mockData";
import { formatRupiah } from "../utils/formatRupiah";

function Invoice() {
  const { invoices, activeInvoice, setActiveInvoice, addInvoice } = useInvoice();
  const { get, post, loading } = useGAS();
  const [queryId, setQueryId] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("LUNAS");
  const [statusMessage, setStatusMessage] = useState("");

  const rows = useMemo(() => {
    const merged = [...invoices];

    mockInvoices.forEach((invoice) => {
      if (!merged.find((item) => item.id_invoice === invoice.id_invoice)) {
        merged.push(invoice);
      }
    });

    return merged;
  }, [invoices]);

  const columns = useMemo(
    () => [
      { key: "id_invoice", label: "Invoice" },
      { key: "id_transaksi", label: "Transaksi" },
      { key: "nama_mitra", label: "Mitra" },
      {
        key: "grand_total",
        label: "Total",
        render: (row) => formatRupiah(row.grand_total || 0),
      },
      {
        key: "status_wa",
        label: "WA",
        render: (row) => <Badge variant={row.status_wa === "TERKIRIM" ? "success" : "warning"}>{row.status_wa || "PENDING"}</Badge>,
      },
      {
        key: "aksi",
        label: "",
        render: (row) => (
          <Button onClick={() => setActiveInvoice(row)} size="sm" variant="secondary">
            Lihat
          </Button>
        ),
      },
    ],
    [setActiveInvoice],
  );

  const searchInvoice = async () => {
    if (!queryId) {
      setStatusMessage("Masukkan ID invoice terlebih dahulu.");
      return;
    }

    try {
      const response = await get("getInvoice", { id: queryId });
      if (response?.data?.id_invoice) {
        addInvoice(response.data);
        setStatusMessage(`Invoice ${response.data.id_invoice} ditemukan.`);
        return;
      }
    } catch {
      // fallback lokal
    }

    const fromLocal = rows.find((invoice) => invoice.id_invoice === queryId);
    if (fromLocal) {
      setActiveInvoice(fromLocal);
      setStatusMessage(`Invoice ${fromLocal.id_invoice} ditemukan dari data lokal.`);
      return;
    }

    setStatusMessage("Invoice tidak ditemukan.");
  };

  const updateStatus = async () => {
    if (!activeInvoice?.id_invoice) {
      setStatusMessage("Pilih invoice lebih dulu.");
      return;
    }

    try {
      await post("updateStatusInvoice", {
        id_invoice: activeInvoice.id_invoice,
        status: statusUpdate,
      });
      setStatusMessage("Status invoice berhasil diupdate ke server.");
    } catch {
      setStatusMessage("Server belum tersedia, status tersimpan di tampilan lokal.");
    }

    setActiveInvoice((current) => (current ? { ...current, status: statusUpdate } : current));
  };

  return (
    <div className="space-y-4">
      <Card title="Kelola Invoice" description="Cari invoice, lihat detail, dan update status pembayaran.">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-3">
            <Input
              id="queryInvoice"
              label="Cari Invoice"
              onChange={(event) => setQueryId(event.target.value)}
              placeholder="INV-YYYYMMDD-XXXX"
              value={queryId}
            />
            <Button disabled={loading} onClick={searchInvoice}>
              Cari Invoice
            </Button>
          </div>

          <div className="space-y-3">
            <Select
              id="statusInvoice"
              label="Update Status"
              onChange={(event) => setStatusUpdate(event.target.value)}
              options={[
                { value: "LUNAS", label: "LUNAS" },
                { value: "BELUM LUNAS", label: "BELUM LUNAS" },
              ]}
              value={statusUpdate}
            />
            <Button disabled={loading} onClick={updateStatus} variant="secondary">
              Simpan Status
            </Button>
          </div>
        </div>
        {statusMessage ? <p className="mt-3 text-sm text-slate-600">{statusMessage}</p> : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Daftar Invoice">
          <Table columns={columns} rows={rows} />
        </Card>
        <InvoicePreview invoice={activeInvoice} />
      </div>
    </div>
  );
}

export default Invoice;
