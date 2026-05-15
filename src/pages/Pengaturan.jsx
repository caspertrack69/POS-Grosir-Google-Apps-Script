import { useState } from "react";
import Card from "../components/ui/card";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import { getGasToken, saveGasToken } from "../utils/gasApi";

function Pengaturan() {
  const [token, setToken] = useState(() => getGasToken());
  const [status, setStatus] = useState("");

  const save = () => {
    saveGasToken(token.trim());
    setStatus("Token GAS berhasil diperbarui di browser lokal.");
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <Card title="Pengaturan Integrasi" description="Konfigurasi endpoint dan token backend Google Apps Script.">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Endpoint GAS diambil dari environment variable `VITE_GAS_BASE_URL`.</p>
          <Input
            id="gas-token"
            label="Bearer Token GAS"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Masukkan token untuk Authorization header"
            value={token}
          />
          <Button onClick={save}>Simpan Token Lokal</Button>
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
        </div>
      </Card>

      <Card title="Catatan Keamanan">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Gunakan token panjang acak, simpan master token di Script Properties pada Google Apps Script.</li>
          <li>Jangan commit file `.env` ke repository.</li>
          <li>Batasi sharing link invoice PDF sesuai kebutuhan operasional.</li>
        </ul>
      </Card>
    </div>
  );
}

export default Pengaturan;
