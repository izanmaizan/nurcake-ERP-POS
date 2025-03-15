import React, { useState, useEffect } from "react";
import AdminLayananMUA from "../components/AdminLayananMUA";
import axios from "axios";

const LayananMUA = () => {
  const [selectedPaket, setSelectedPaket] = useState("");
  const [namaPemesan, setNamaPemesan] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [pesan, setPesan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [paketLayanan, setPaketLayanan] = useState([]);
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [alamat, setAlamat] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [dpAmount, setDpAmount] = useState(0);
  const [sisaPembayaran, setSisaPembayaran] = useState(0);
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [kembalian, setKembalian] = useState(0);

  useEffect(() => {
    fetchPaketLayanan();
  }, []);

  const fetchPaketLayanan = async () => {
    try {
      const response = await axios.get("http://localhost:3000/layanan");
      const parsedData = response.data.map((item) => ({
        ...item,
        layanan: Array.isArray(item.layanan)
          ? item.layanan
          : typeof item.layanan === "string"
            ? tryParseJSON(item.layanan) || []
            : [],
      }));
      setPaketLayanan(parsedData);
    } catch (error) {
      console.error("Error fetching layanan:", error);
      alert("Gagal mengambil data layanan");
    }
  };

  // Fungsi helper untuk mencoba parsing JSON dengan aman
  const tryParseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Error parsing JSON:", error);
      return null;
    }
  };

  // Update total harga saat paket dipilih
  const handlePaketChange = (e) => {
    const selectedId = e.target.value;
    setSelectedPaket(selectedId);

    const selectedPaketData = paketLayanan.find(
      (paket) => paket.id_layanan.toString() === selectedId
    );

    if (selectedPaketData) {
      // Harga sudah dalam bentuk integer, tidak perlu replace
      const harga = parseInt(selectedPaketData.harga);
      setTotalHarga(harga);
      setSisaPembayaran(harga);
    } else {
      setTotalHarga(0);
      setSisaPembayaran(0);
    }
  };

  // Handle perubahan jumlah pembayaran
  const handlePembayaranChange = (e) => {
    const bayar = parseInt(e.target.value) || 0;
    setJumlahBayar(bayar);

    // Pastikan semua perhitungan menggunakan integer
    if (bayar >= totalHarga) {
      setMetodePembayaran("Cash");
      setDpAmount(totalHarga);
      setSisaPembayaran(0);
      setKembalian(bayar - totalHarga);
    } else if (bayar > 0 && bayar < totalHarga) {
      setMetodePembayaran("DP");
      setDpAmount(bayar);
      setSisaPembayaran(totalHarga - bayar);
      setKembalian(0);
    } else {
      setMetodePembayaran("");
      setDpAmount(0);
      setSisaPembayaran(totalHarga);
      setKembalian(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        tanggal_booking: tanggal,
        waktu_mulai: jam,
        waktu_selesai: waktuSelesai,
        id_layanan: selectedPaket,
        nama_pelanggan: namaPemesan,
        no_telepon: nomorHp,
        alamat: alamat,
        total_harga: totalHarga,
        dp_amount: dpAmount,
        sisa_pembayaran: sisaPembayaran,
        metode_pembayaran: metodePembayaran,
        kembalian: kembalian,
        catatan: pesan,
      };

      const response = await axios.post(
        "http://localhost:3000/booking",
        bookingData
      );
      if (response.status === 201) {
        alert("Booking berhasil dibuat!");
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Gagal membuat booking");
    }
  };

  const resetForm = () => {
    setSelectedPaket("");
    setNamaPemesan("");
    setNomorHp("");
    setPesan("");
    setTanggal("");
    setJam("");
    setWaktuSelesai("");
    setAlamat("");
    setTotalHarga(0);
    setJumlahBayar(0);
    setDpAmount(0);
    setSisaPembayaran(0);
    setMetodePembayaran("");
    setKembalian(0);
  };

  return (
    // LayananMUA
    <section className="bg-[#1a1a1a] min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-4">
            Paket Layanan Makeup Artist (MUA)
          </h1>
          <p className="text-[#DAA520] text-lg">
            Temukan paket makeup yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        <AdminLayananMUA />

        <div className="mt-16 bg-[#2d2d2d] rounded-xl shadow-lg p-8 max-w-3xl mx-auto border border-[#FFD700]">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-8 text-center">
            Formulir Booking
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={namaPemesan}
                onChange={(e) => setNamaPemesan(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Nomor HP
              </label>
              <input
                type="tel"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Pilih Paket
              </label>
              <select
                value={selectedPaket}
                onChange={handlePaketChange}
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                required>
                <option value="">-- Pilih Paket Layanan --</option>
                {paketLayanan.map((paket) => (
                  <option key={paket.id_layanan} value={paket.id_layanan}>
                    {paket.nama_paket} - {paket.kategori} - Rp{" "}
                    {paket.harga.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Tanggal Layanan
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Jam Layanan
                </label>
                <input
                  type="time"
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Waktu Selesai
                </label>
                <input
                  type="time"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Alamat
                </label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  required></textarea>
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Total Harga
                </label>
                <input
                  type="text"
                  value={`Rp ${totalHarga.toLocaleString()}`}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Jumlah Bayar
                </label>
                <input
                  type="number"
                  value={jumlahBayar}
                  onChange={handlePembayaranChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Status Pembayaran
                </label>
                <input
                  type="text"
                  value={metodePembayaran}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  DP
                </label>
                <input
                  type="text"
                  value={`Rp ${dpAmount.toLocaleString()}`}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Sisa Pembayaran
                </label>
                <input
                  type="text"
                  value={`Rp ${sisaPembayaran.toLocaleString()}`}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[#DAA520] font-semibold mb-2">
                  Kembalian
                </label>
                <input
                  type="text"
                  value={`Rp ${kembalian.toLocaleString()}`}
                  className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Pesan Tambahan
              </label>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                placeholder="Tuliskan pesan atau permintaan khusus Anda..."></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700] text-[#1a1a1a] py-4 rounded-lg font-semibold hover:bg-[#DAA520] transition-colors duration-300">
              Kirim Pesanan
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LayananMUA;
