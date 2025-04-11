import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DaftarProduk from "../components/DaftarProdukPOSNurCake.jsx";
import TransaksiPOSNurCake from "../components/TransaksiPOSNurCake.jsx";

// Konstanta tema warna krem/emas
const COLORS = {
  primary: "#D4AF37",     // Emas utama
  secondary: "#C5B358",   // Emas sekunder
  accent: "#E6BE8A",      // Aksen krem/emas
  bgLight: "#FAF3E0",     // Krem muda untuk background
  textDark: "#8B7D3F",    // Emas gelap untuk teks
  textMedium: "#B8A361",  // Emas sedang untuk teks sekunder
  cardBg: "#FFF8E7"       // Krem sangat muda untuk kartu
};

// Konstanta API
const API = import.meta.env.VITE_API || "http://localhost:3000";

const POSNurCake = () => {
  const daftarProdukRef = useRef(null);
  const transaksiRef = useRef(null);
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Deteksi ukuran layar untuk responsivitas
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fungsi untuk menampilkan/menyembunyikan tombol scroll berdasarkan posisi scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi untuk scroll ke atas dengan performa yang dioptimalkan
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Fungsi untuk mengambil daftar produk
  useEffect(() => {
    const fetchProdukList = async () => {
      try {
        const response = await axios.get(`${API}/produkNC`);
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
          await axios.delete(`${API}/kue-ready/${kue.id_kue}`);
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

      // Trigger refresh daftar kue ready
      triggerKueReadyRefresh();

      // Notifikasi sukses
      // alert("Transaksi berhasil dilakukan!");
    } catch (error) {
      console.error("Error dalam transaksi:", error);
      alert("Gagal melakukan transaksi");
    }
  };

  // Fungsi untuk menangani item yang telah dihapus
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
      <section
          className="py-6 px-4 min-h-screen w-full sm:py-8 md:py-12 lg:py-16 md:px-8 lg:px-12 mt-4"
          style={{ backgroundColor: COLORS.bgLight }}
      >
        <h1
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mt-12 md:mt-4 mb-3 md:mb-5 font-Roboto text-center md:text-left"
            style={{ color: COLORS.primary }}
        >
          Point of Sales Nur Cake
        </h1>

        {/* Layout Container - Column on Mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row md:space-x-4 lg:space-x-8">
          {/* DaftarProduk Container */}
          <div ref={daftarProdukRef} className="w-full md:w-1/2 mb-6 md:mb-0">
            <DaftarProduk
                produkList={produkList}
                handleAddProduk={handleAddProduk}
                selectedProduk={selectedProduk}
                onItemRemoved={handleItemRemoved}
                refreshTrigger={refreshKueReady}
                colors={COLORS}
            />
          </div>

          {/* TransaksiPOSNurCake Container */}
          <div ref={transaksiRef} className="w-full md:w-1/2">
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
                colors={COLORS}
            />
          </div>
        </div>

        {/* Tombol Scroll ke Atas dengan Animasi */}
        {showScrollButton && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-20 right-4 p-3 sm:bottom-6 sm:right-8 sm:p-3 rounded-full shadow-lg transition-all duration-300 z-50 focus:outline-none hover:scale-110"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.bgLight
                }}
                aria-label="Kembali ke atas"
                title="Kembali ke atas"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
        )}

        {isMobile && showScrollButton && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-50">
              <button
                  onClick={() => daftarProdukRef.current.scrollIntoView({ behavior: "smooth" })}
                  className="p-3 rounded-full shadow-lg focus:outline-none hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: COLORS.bgLight,
                  }}
                  aria-label="Ke atas - Daftar Produk"
              >
                📦
              </button>
              <button
                  onClick={() => transaksiRef.current.scrollIntoView({ behavior: "smooth" })}
                  className="p-3 rounded-full shadow-lg focus:outline-none hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: COLORS.bgLight,
                  }}
                  aria-label="Ke atas - Transaksi"
              >
                💵
              </button>
            </div>
        )}
      </section>
  );
};

export default POSNurCake;