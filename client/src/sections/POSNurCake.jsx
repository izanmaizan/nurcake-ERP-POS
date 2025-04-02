import React, { useState, useEffect } from "react";
import axios from "axios";
import DaftarProduk from "../components/DaftarProdukPOSNurCake.jsx";
import TransaksiPOSNurCake from "../components/TransaksiPOSNurCake.jsx";
// import { dummyProducts } from "../components/data/dummyData";

const POSNurCake = () => {
  const [produkList, setProdukList] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [onKueReadyReturn, setOnKueReadyReturn] = useState(null);
  const [tanggalTransaksi, setTanggalTransaksi] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tanggalPengambilan, setTanggalPengambilan] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [refreshKueReady, setRefreshKueReady] = useState(0);

  // Tambahkan fungsi untuk menampilkan/menyembunyikan tombol scroll berdasarkan posisi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fungsi untuk scroll ke atas dengan efek smooth yang lebih halus
  const scrollToTop = () => {
    // Metode dengan animasi yang lebih halus
    const scrollStep = -window.scrollY / 15; // Semakin kecil pembagi, semakin cepat
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
      }
    }, 15); // Interval yang lebih rendah membuat animasi lebih smooth

    // Alternatif menggunakan scrollTo dengan behavior smooth
    // window.scrollTo({
    //   top: 0,
    //   behavior: "smooth"
    // });
  };

  // Tambahkan fungsi untuk mengambil daftar produk
  useEffect(() => {
    const fetchProdukList = async () => {
      try {
        const response = await axios.get("http://localhost:3000/produkNC");
        setProdukList(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil daftar produk:", error);
        alert("Gagal mengambil daftar produk.");
      }
    };

    fetchProdukList();
  }, []);

  // Fungsi untuk memicu refresh daftar kue ready
  const triggerKueReadyRefresh = () => {
    setRefreshKueReady(prev => prev + 1);
  };

  // Fungsi untuk menangani pengembalian kue ready
  const handleReturnKueReady = (returnedKue) => {
    if (returnedKue && returnedKue.id_kue) {
      // Panggil callback yang diberikan dari DaftarProdukPOSNurCake
      if (onKueReadyReturn) {
        onKueReadyReturn(returnedKue);
      }
    }
  };

  const handleAddProduk = (produk) => {
    // Handle custom cake
    if (produk.tipe === "custom_cake") {
      setSelectedProduk([...selectedProduk, { ...produk }]);
      return;
    }

    // Handle kue ready
    if (produk.id_kue) {
      const existingKue = selectedProduk.find(
        (item) => item.id_kue === produk.id_kue
      );
      if (!existingKue) {
        setSelectedProduk([...selectedProduk, { ...produk }]);
      }
      return;
    }

    // Handle regular product
    const existingProduk = selectedProduk.find(
      (item) => item.id_produk === produk.id_produk
    );
    if (existingProduk) {
      setSelectedProduk(
        selectedProduk.map((item) =>
          item.id_produk === produk.id_produk
            ? { ...item, jumlah: item.jumlah + 1 }
            : item
        )
      );
    } else {
      setSelectedProduk([...selectedProduk, { ...produk, jumlah: 1 }]);
    }
  };

  const handleRemoveProduk = (id, type, returnToList = false) => {
    let removedItem = null;

    if (type === "kue_ready") {
      // Simpan item yang dihapus jika perlu dikembalikan ke daftar
      if (returnToList) {
        removedItem = selectedProduk.find((item) => item.id_kue === id);
      }
      setSelectedProduk(selectedProduk.filter((item) => item.id_kue !== id));
    } else if (type === "custom_cake") {
      setSelectedProduk(selectedProduk.filter((item) => item.id_custom !== id));
    } else {
      setSelectedProduk(selectedProduk.filter((item) => item.id_produk !== id));
    }

    // Jika perlu mengembalikan item ke daftar, panggil callback
    if (returnToList && removedItem && onReturnItemToList) {
      onReturnItemToList(removedItem);
    }
  };

  const handleJumlahChange = (produkId, jumlah) => {
    setSelectedProduk(
      selectedProduk.map((item) =>
        item.id_produk === produkId ? { ...item, jumlah: jumlah } : item
      )
    );
  };

  const handleJualProduk = async () => {
    try {
      // Untuk setiap kue ready yang dipilih, hapus dari database
      const kueReadyItems = selectedProduk.filter((item) => item.id_kue);

      for (const kue of kueReadyItems) {
        try {
          // Hapus kue ready dari database
          await axios.delete(`http://localhost:3000/kue-ready/${kue.id_kue}`);
        } catch (error) {
          console.error(
            `Gagal menghapus kue ready dengan ID ${kue.id_kue}:`,
            error
          );
        }
      }

      // Reset selected products after successful transaction
      setSelectedProduk([]);
      // Reset dates to current date
      const currentDate = new Date().toISOString().slice(0, 10);
      setTanggalTransaksi(currentDate);
      setTanggalPengambilan(currentDate);

      // Tambahkan: Trigger refresh daftar kue ready
      triggerKueReadyRefresh();
    } catch (error) {
      console.error("Error dalam transaksi:", error);
      alert("Gagal melakukan transaksi");
    }
  };

  // Tambahkan fungsi ini untuk menangani item yang telah dihapus
  const handleItemRemoved = (id, type) => {
    // Item sudah dihapus dari database, sekarang hapus dari state
    if (type === "kue_ready") {
      setSelectedProduk((prev) => prev.filter((item) => item.id_kue !== id));
    }
  };

  useEffect(() => {
    const total = selectedProduk.reduce((sum, item) => {
      if (item.id_custom) {
        return sum + item.harga_jual;
      }
      const quantity = item.id_kue ? 1 : item.jumlah;
      return sum + item.harga_jual * quantity;
    }, 0);
    setTotalHarga(total);
  }, [selectedProduk]);

  return (
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-24 md:px-20 flex space-x-8">
      <div className="flex-1">
        <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
          Point of Sales Nur Cake
        </h1>

        <DaftarProduk
          produkList={produkList}
          handleAddProduk={handleAddProduk}
          selectedProduk={selectedProduk}
          onItemRemoved={handleItemRemoved}
          refreshTrigger={refreshKueReady}
        />
      </div>

      <div className="flex-1">
        <TransaksiPOSNurCake
          totalHarga={totalHarga}
          setTotalHarga={setTotalHarga}
          selectedProduk={selectedProduk}
          handleJumlahProdukChange={handleJumlahChange}
          handleRemoveProduk={handleRemoveProduk}
          handleJualProduk={handleJualProduk}
          tanggalTransaksi={tanggalTransaksi}
          tanggalPengambilan={tanggalPengambilan}
          handleTanggalTransaksiChange={setTanggalTransaksi}
          handleTanggalPengambilanChange={setTanggalPengambilan}
          triggerKueReadyRefresh={triggerKueReadyRefresh}
        />
      </div>

      {/* Tombol Scroll ke Atas dengan Animasi */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#FFD700] hover:bg-[#E6C200] text-[#1a1a1a] rounded-full p-3 shadow-lg transition-all duration-300 z-50 focus:outline-none animate-pulse hover:animate-none"
          aria-label="Kembali ke atas"
          title="Kembali ke atas">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </section>
  );
};

export default POSNurCake;
