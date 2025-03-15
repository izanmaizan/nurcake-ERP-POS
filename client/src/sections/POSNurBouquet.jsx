import React, { useState, useEffect } from "react";
import axios from "axios";
import DaftarBuket from "../components/DaftarBuketPOSNurBouquet.jsx";
import TransaksiPOSNurBouquet from "../components/TransaksiPOSNurBouquet.jsx";

const POSNurBouquet = () => {
  const [produkList, setProdukList] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [totalHarga, setTotalHarga] = useState(0);
  const [jumlahDibayar, setJumlahDibayar] = useState(0);
  const [metodePembayaran, setMetodePembayaran] = useState("Cash");
  const [statusPembayaran, setStatusPembayaran] = useState("Pas");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [alamatPengiriman, setAlamatPengiriman] = useState("");

  useEffect(() => {
    fetchProdukList();
  }, []);

  const fetchProdukList = async () => {
    try {
      const response = await axios.get("http://localhost:3000/produkNBA");
      setProdukList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar produk:", error);
      alert("Gagal mengambil daftar produk.");
    }
  };

  const handleAddProduk = (produk) => {
    const existingProduk = selectedProduk.find((item) => item.id === produk.id);
    if (existingProduk) {
      setSelectedProduk(
        selectedProduk.map((item) =>
          item.id === produk.id ? { ...item, jumlah: item.jumlah + 1 } : item
        )
      );
    } else {
      setSelectedProduk([...selectedProduk, { ...produk, jumlah: 1 }]);
    }
  };

  const handleRemoveProduk = (produkId) => {
    setSelectedProduk(selectedProduk.filter((item) => item.id !== produkId));
  };

  const handleJumlahChange = (produkId, jumlah) => {
    setSelectedProduk(
      selectedProduk.map((item) =>
        item.id === produkId ? { ...item, jumlah: jumlah } : item
      )
    );
  };

  useEffect(() => {
    const total = selectedProduk.reduce(
      (sum, item) => sum + item.harga * item.jumlah,
      0
    );
    setTotalHarga(total);

    const status =
      jumlahDibayar > total
        ? `Kembalian: Rp ${(jumlahDibayar - total).toLocaleString()}`
        : jumlahDibayar < total
          ? `Kurang: Rp ${(total - jumlahDibayar).toLocaleString()}`
          : "Pas";
    setStatusPembayaran(status);
  }, [selectedProduk, jumlahDibayar]);

  const handleSubmitOrder = (orderData) => {
    if (!orderData.selectedProduk || orderData.selectedProduk.length === 0) {
      alert("Silakan pilih produk terlebih dahulu");
      return;
    }

    const formattedData = {
      tanggal_transaksi: orderData.tanggalTransaksi,
      tanggal_pengambilan: orderData.tanggalPengambilan,
      id_produk: orderData.selectedProduk[0].id,
      jumlah: orderData.selectedProduk[0].jumlah,
      harga_satuan: orderData.selectedProduk[0].harga,
      total_harga: orderData.totalHarga,
      jumlah_dibayar: orderData.jumlahDibayar,
      kembalian: orderData.kembalian || 0,
      metode_pembayaran: orderData.bayarCashOrDP,
      status_pembayaran:
        orderData.statusPembayaran === "Lunas" ? "Lunas" : "Belum Lunas",
      nama_pelanggan: orderData.nama_pelanggan,
      no_telepon: orderData.no_telepon,
      catatan: orderData.catatan || "",
    };

    console.log("Data yang akan dikirim:", formattedData);

    axios
      .post("http://localhost:3000/transaksi-nba", formattedData)
      .then((response) => {
        alert("Pesanan berhasil dibuat!");
        // Reset form
        setSelectedProduk([]);
        setCatatan("");
        setJumlahDibayar(0);
        setStatusPembayaran("Pas");
      })
      .catch((error) => {
        console.error("Gagal membuat pesanan:", error);
        alert(
          "Gagal membuat pesanan: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  return (
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-24 md:px-20 flex space-x-8">
      <div className="flex-1">
        <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
          Point of Sales (POS) Nur Bouquet Aest
        </h1>

        {/* Daftar Buket */}
        <DaftarBuket
          produkList={produkList}
          handleAddProduk={handleAddProduk}
        />
      </div>

      {/* Transaksi Details */}
      <div className="flex-1">
        <TransaksiPOSNurBouquet
          selectedProduk={selectedProduk}
          totalHarga={totalHarga}
          handleJumlahProdukChange={handleJumlahChange}
          handleRemoveProduk={handleRemoveProduk}
          handleJumlahDibayarChange={setJumlahDibayar}
          handleSubmitOrder={handleSubmitOrder}
        />
      </div>
    </section>
  );
};

export default POSNurBouquet;
