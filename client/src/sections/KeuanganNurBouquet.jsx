import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Modal } from "../components/ui/modal";

const KeuanganNurBouquet = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTanggal, setFilterTanggal] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/transaksi-nba");
      const validData = response.data.map((item) => ({
        ...item,
        total_harga: parseFloat(item.total_harga) || 0,
        jumlah_dibayar: parseFloat(item.jumlah_dibayar) || 0,
        kembalian: parseFloat(item.kembalian) || 0,
        utang: parseFloat(item.utang) || 0,
      }));
      setTransaksi(validData);
      setError(null);
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
      setError("Gagal mengambil data transaksi. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaksiDetail = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/transaksi-nba/${id}`
      );
      setSelectedTransaksi(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Gagal mengambil detail transaksi:", error);
      setError("Gagal mengambil detail transaksi.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterTanggal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getFilteredTransaksi = () => {
    return transaksi.filter((item) => {
      if (!filterTanggal.startDate && !filterTanggal.endDate) return true;

      const tanggalTransaksi = new Date(item.tanggal_transaksi);
      const startDate = filterTanggal.startDate
        ? new Date(filterTanggal.startDate)
        : null;
      const endDate = filterTanggal.endDate
        ? new Date(filterTanggal.endDate)
        : null;

      if (startDate && endDate) {
        return tanggalTransaksi >= startDate && tanggalTransaksi <= endDate;
      } else if (startDate) {
        return tanggalTransaksi >= startDate;
      } else if (endDate) {
        return tanggalTransaksi <= endDate;
      }
      return true;
    });
  };

  const hitungTotalPendapatan = () => {
    return getFilteredTransaksi().reduce((total, item) => {
      const harga = parseFloat(item.total_harga) || 0;
      return total + harga;
    }, 0);
  };

  const hitungTotalPembayaran = () => {
    return getFilteredTransaksi().reduce((total, item) => {
      const bayar = parseFloat(item.jumlah_dibayar) || 0;
      return total + bayar;
    }, 0);
  };

  const hitungPiutang = () => {
    return hitungTotalPendapatan() - hitungTotalPembayaran();
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const generateStruk = (transaksi) => {
    // Buat instance jsPDF dengan orientasi potrait dan satuan mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 150], // Ukuran kertas struk kasir standar (80mm x sesuai kebutuhan)
    });

    // Set font ke courier untuk tampilan seperti struk kasir
    doc.setFont("courier");

    // Fungsi untuk membuat teks center
    const center = (text, y) => {
      const textWidth =
        (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const x = (doc.internal.pageSize.getWidth() - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Header
    doc.setFontSize(12);
    center("NUR BOUQUET AEST", 10);
    doc.setFontSize(8);
    center("Jl. Koto Panai 118, Air Haji", 15);
    center("Telp: 081234567890", 19);

    // Garis pemisah
    doc.setLineWidth(0.1);
    doc.line(5, 22, 75, 22);

    // Informasi transaksi
    doc.setFontSize(8);
    doc.text(`No. : ${transaksi.id_transaksi}`, 5, 27);
    doc.text(`Kasir: ADMIN`, 5, 31);
    const tanggal = new Date(transaksi.tanggal_transaksi).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    const waktu = new Date(transaksi.tanggal_transaksi).toLocaleTimeString(
      "id-ID"
    );
    doc.text(`Tgl : ${tanggal}`, 5, 35);
    doc.text(`Jam : ${waktu}`, 5, 39);

    // Garis pemisah
    doc.line(5, 41, 75, 41);

    // Informasi pelanggan
    doc.text(`Pelanggan: ${transaksi.nama_pelanggan}`, 5, 45);
    doc.text(`Telp    : ${transaksi.no_telepon}`, 5, 49);

    // Garis pemisah
    doc.line(5, 51, 75, 51);

    // Header tabel
    let y = 55;
    doc.text("Produk", 5, y);
    doc.text("Qty", 45, y);
    doc.text("Total", 60, y);
    y += 4;
    doc.line(5, y, 75, y);
    y += 4;

    // Detail produk
    doc.text("Buket Bunga", 5, y);
    doc.text(`${transaksi.jumlah}`, 45, y);
    doc.text(
      `${formatRupiah(transaksi.total_harga).replace("Rp", "").trim()}`,
      60,
      y
    );
    y += 4;

    // Rincian harga per item
    doc.setFontSize(7);
    doc.text(
      `${formatRupiah(transaksi.harga_satuan).replace("Rp", "").trim()} x ${transaksi.jumlah}`,
      10,
      y
    );
    y += 6;

    // Garis pemisah
    doc.line(5, y, 75, y);
    y += 4;

    // Total
    doc.setFontSize(8);
    doc.text("TOTAL", 5, y);
    doc.text(
      `${formatRupiah(transaksi.total_harga).replace("Rp", "").trim()}`,
      60,
      y
    );
    y += 4;

    // Pembayaran
    doc.text("TUNAI", 5, y);
    doc.text(
      `${formatRupiah(transaksi.jumlah_dibayar).replace("Rp", "").trim()}`,
      60,
      y
    );
    y += 4;

    // Kembalian/Utang
    if (transaksi.kembalian > 0) {
      doc.text("KEMBALI", 5, y);
      doc.text(
        `${formatRupiah(transaksi.kembalian).replace("Rp", "").trim()}`,
        60,
        y
      );
      y += 4;
    }

    if (transaksi.utang > 0) {
      doc.text("SISA UTANG", 5, y);
      doc.text(
        `${formatRupiah(transaksi.utang).replace("Rp", "").trim()}`,
        60,
        y
      );
      y += 4;
    }

    // Garis pemisah
    doc.line(5, y, 75, y);
    y += 5;

    // Status pembayaran
    center(`* ${transaksi.status_pembayaran.toUpperCase()} *`, y);
    y += 4;

    // Tanggal pengambilan jika ada
    if (transaksi.tanggal_pengambilan) {
      y += 3;
      center("Tanggal Pengambilan:", y);
      y += 4;
      center(
        new Date(transaksi.tanggal_pengambilan).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        y
      );
      y += 4;
    }

    // Catatan jika ada
    if (transaksi.catatan) {
      y += 3;
      doc.text("Catatan:", 5, y);
      y += 4;
      // Wrap text untuk catatan panjang
      const splitCatatan = doc.splitTextToSize(transaksi.catatan, 65);
      doc.text(splitCatatan, 5, y);
      y += splitCatatan.length * 4;
    }

    // Footer
    y += 3;
    center("================================", y);
    y += 4;
    center("Terima Kasih", y);
    y += 4;
    center("Atas Kunjungan Anda", y);
    y += 4;
    center("================================", y);

    // QR Code atau Barcode bisa ditambahkan di sini jika diperlukan

    // Simpan PDF
    doc.save(`struk-${transaksi.id_transaksi}.pdf`);
  };

  return (
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
        Keuangan Nur Bouquet Aest
      </h1>

      {error && (
        <div className="bg-[#3d3d3d] border border-red-400 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Tanggal */}
      <div className="mb-6 bg-[#2d2d2d] p-4 rounded-lg shadow-md border border-[#FFD700]">
        <h3 className="text-lg font-semibold text-[#FFD700] mb-3">
          Filter Transaksi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#DAA520]">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="startDate"
              value={filterTanggal.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md bg-[#3d3d3d] border-[#FFD700] shadow-sm focus:border-[#DAA520] focus:ring-[#DAA520] text-[#FFD700]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#DAA520]">
              Tanggal Akhir
            </label>
            <input
              type="date"
              name="endDate"
              value={filterTanggal.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md bg-[#3d3d3d] border-[#FFD700] shadow-sm focus:border-[#DAA520] focus:ring-[#DAA520] text-[#FFD700]"
            />
          </div>
        </div>
      </div>

      {/* Ringkasan Keuangan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md border border-[#FFD700]">
          <h3 className="text-xl font-semibold text-[#FFD700] mb-2">
            Total Pendapatan
          </h3>
          <p className="text-2xl font-bold text-[#DAA520]">
            {formatRupiah(hitungTotalPendapatan())}
          </p>
        </div>
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md border border-[#FFD700]">
          <h3 className="text-xl font-semibold text-[#FFD700] mb-2">
            Total Pembayaran
          </h3>
          <p className="text-2xl font-bold text-[#DAA520]">
            {formatRupiah(hitungTotalPembayaran())}
          </p>
        </div>
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md border border-[#FFD700]">
          <h3 className="text-xl font-semibold text-[#FFD700] mb-2">
            Total Piutang
          </h3>
          <p className="text-2xl font-bold text-[#DAA520]">
            {formatRupiah(hitungPiutang())}
          </p>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="mb-8">
        <h2 className="text-[30px] font-semibold mb-5 text-[#FFD700] font-Roboto">
          Daftar Transaksi
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#2d2d2d] shadow-md rounded-lg overflow-hidden border border-[#FFD700]">
              <thead className="bg-[#3d3d3d]">
                <tr>
                  <th className="px-4 py-2 text-[#FFD700]">Tanggal</th>
                  <th className="px-4 py-2 text-[#FFD700]">Pelanggan</th>
                  <th className="px-4 py-2 text-[#FFD700]">Total Harga</th>
                  <th className="px-4 py-2 text-[#FFD700]">Dibayar</th>
                  <th className="px-4 py-2 text-[#FFD700]">Status</th>
                  <th className="px-4 py-2 text-[#FFD700]">
                    Metode Pembayaran
                  </th>
                  <th className="px-4 py-2 text-[#FFD700]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTransaksi().map((item) => (
                  <tr key={item.id_transaksi} className="hover:bg-[#3d3d3d]">
                    <td className="px-4 py-2 border-b border-[#DAA520] text-[#DAA520]">
                      {new Date(item.tanggal_transaksi).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520] text-[#DAA520]">
                      {item.nama_pelanggan}
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520] text-[#DAA520]">
                      {formatRupiah(item.total_harga)}
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520] text-[#DAA520]">
                      {formatRupiah(item.jumlah_dibayar)}
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520]">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          item.status_pembayaran === "Lunas"
                            ? "bg-[#3d3d3d] text-[#FFD700]"
                            : "bg-[#3d3d3d] text-red-400"
                        }`}>
                        {item.status_pembayaran}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520] text-[#DAA520]">
                      {item.metode_pembayaran}
                    </td>
                    <td className="px-4 py-2 border-b border-[#DAA520]">
                      <button
                        onClick={() => fetchTransaksiDetail(item.id_transaksi)}
                        className="mr-2 px-3 py-1 bg-[#3d3d3d] text-[#FFD700] rounded hover:bg-[#4d4d4d] border border-[#FFD700]">
                        Detail
                      </button>
                      <button
                        onClick={() => generateStruk(item)}
                        className="px-3 py-1 bg-[#3d3d3d] text-[#FFD700] rounded hover:bg-[#4d4d4d] border border-[#FFD700]">
                        Cetak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Transaksi */}
      {showModal && selectedTransaksi && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Detail Transaksi">
          <div className="p-4 bg-[#2d2d2d] text-[#DAA520]">
            <h3 className="text-lg font-semibold mb-4 text-[#FFD700]">
              Informasi Transaksi #{selectedTransaksi.id_transaksi}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-[#FFD700]">Tanggal Transaksi:</p>
                <p>
                  {new Date(
                    selectedTransaksi.tanggal_transaksi
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">
                  Tanggal Pengambilan:
                </p>
                <p>
                  {new Date(
                    selectedTransaksi.tanggal_pengambilan
                  ).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Nama Pelanggan:</p>
                <p>{selectedTransaksi.nama_pelanggan}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">No. Telepon:</p>
                <p>{selectedTransaksi.no_telepon}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Total Harga:</p>
                <p>{formatRupiah(selectedTransaksi.total_harga)}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Jumlah Dibayar:</p>
                <p>{formatRupiah(selectedTransaksi.jumlah_dibayar)}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Kembalian:</p>
                <p>{formatRupiah(selectedTransaksi.kembalian)}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Sisa Utang:</p>
                <p>{formatRupiah(selectedTransaksi.utang)}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Status Pembayaran:</p>
                <p>{selectedTransaksi.status_pembayaran}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Metode Pembayaran:</p>
                <p>{selectedTransaksi.metode_pembayaran}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Jumlah Produk:</p>
                <p>{selectedTransaksi.jumlah}</p>
              </div>
              <div>
                <p className="font-medium text-[#FFD700]">Harga Satuan:</p>
                <p>{formatRupiah(selectedTransaksi.harga_satuan)}</p>
              </div>
            </div>
            {selectedTransaksi.catatan && (
              <div className="mt-4">
                <p className="font-medium text-[#FFD700]">Catatan:</p>
                <p className="mt-1 text-[#DAA520]">
                  {selectedTransaksi.catatan}
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => generateStruk(selectedTransaksi)}
                className="px-4 py-2 bg-[#3d3d3d] text-[#FFD700] rounded-md hover:bg-[#4d4d4d] focus:outline-none focus:ring-2 focus:ring-[#DAA520] border border-[#FFD700]">
                Cetak Struk
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default KeuanganNurBouquet;
