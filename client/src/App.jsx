import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Nav } from "./components";
import {
  Beranda,
  Daftar,
  Login,
  Laporan,
  Detail,
  TambahPetugas,
  TambahAkun,
  DaftarAkun,
  NotFound,
  ProdukNurCake,
  POSNurCake,
  LacakPesananKue,
  GudangNurCake,
  KeuanganNurCake,
  ProdukNurBouquet,
  POSNurBouquet,
  KeuanganNurBouquet,
  LayananMUA,
  JadwalMUA,
  PersediaanMUA,
  BukuPesananNurCake,
  HargaKue,
  LaporanNurGroup,
  KeuanganNurGroup,
} from "./sections";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-grow">
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Beranda />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Daftar />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/detail/:no_do" element={<Detail />} />
            <Route path="/tambahpetugas" element={<TambahPetugas />} />
            <Route path="/tambahakun" element={<TambahAkun />} />
            <Route path="/daftarakun" element={<DaftarAkun />} />
            <Route path="/produk-nc" element={<ProdukNurCake />} />
            <Route path="/pos-nc" element={<POSNurCake />} />
            <Route path="/lacak-pesanan-kue" element={<LacakPesananKue />} />
            <Route path="/gudang-nc" element={<GudangNurCake />} />
            <Route path="/keuangan-nc" element={<KeuanganNurCake />} />
            <Route path="/produk-nba" element={<ProdukNurBouquet />} />
            <Route path="/pos-nba" element={<POSNurBouquet />} />
            <Route path="/keuangan-nba" element={<KeuanganNurBouquet />} />
            <Route path="/layanan-nmua" element={<LayananMUA />} />
            <Route path="/jadwal-nmua" element={<JadwalMUA />} />
            <Route path="/persediaan-nmua" element={<PersediaanMUA />} />
            <Route path="/buku-pesanan-nc" element={<BukuPesananNurCake />} />
            <Route path="/harga-kue" element={<HargaKue />} />
            <Route path="/laporan-ng" element={<LaporanNurGroup />} />
            <Route path="/keuangan-ng" element={<KeuanganNurGroup />} />
          </Routes>
        </main>
        <footer className="bg-[#1E1E1E] h-14 w-full flex items-center justify-center border-t border-[#D4AF37]/20">
          <p className="text-[#D4AF37]/80 text-sm tracking-wide">
            © 2024 NUR GROUP ERP By Maizan Insani Akbar. All rights reserved.
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
