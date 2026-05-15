import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Produk from "./pages/Produk";
import Mitra from "./pages/Mitra";
import Invoice from "./pages/Invoice";
import Pengaturan from "./pages/Pengaturan";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/produk" element={<Produk />} />
        <Route path="/mitra" element={<Mitra />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/pengaturan" element={<Pengaturan />} />
      </Routes>
    </AppShell>
  );
}

export default App;
