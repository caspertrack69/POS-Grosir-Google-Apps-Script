import { useState } from "react";
import Button from "../components/ui/button";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import { getGasToken, saveGasToken } from "../utils/gasApi";

function Pengaturan() {
  const [token, setToken] = useState(() => getGasToken());
  const [status, setStatus] = useState("");

  const save = () => {
    saveGasToken(token.trim());
    setStatus("Token GAS berhasil diperbarui di browser lokal.");
  };

  return (
    <div className="space-y-4">
      <Card title="Integrasi Backend" description="Konfigurasi endpoint dan token Google Apps Script.">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Endpoint GAS dibaca dari environment variable `VITE_GAS_BASE_URL`.</p>
          <Input
            id="gas-token"
            label="Bearer Token GAS"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Masukkan token authorization"
            value={token}
          />
          <Button onClick={save}>Simpan Token</Button>
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
        </div>
      </Card>

      <Card title="Checklist Keamanan" description="Panduan minimum untuk operasional aman.">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Gunakan token panjang acak, simpan master token di Script Properties.</li>
          <li>Jangan commit file `.env` ke repository.</li>
          <li>Batasi sharing link invoice PDF sesuai kebutuhan operasional.</li>
        </ul>
      </Card>
    </div>
  );
}

export default Pengaturan;
