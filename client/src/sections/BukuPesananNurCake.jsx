import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Check, X, Search, Printer, Info } from "lucide-react";
import axios from "axios";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const BukuPesananNurCake = () => {
  const API = import.meta.env.VITE_API;

  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-CA");
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-CA");
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPickupStatus, setFilterPickupStatus] = useState("all");
  const [showAllDates, setShowAllDates] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [pickupStatus, setPickupStatus] = useState({});
  const [originalPaymentStatus, setOriginalPaymentStatus] = useState({});
  const [msg, setMsg] = useState("");
  const [detailLengkap, setDetailLengkap] = useState(null);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      fetchPesananData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchPesananData = async () => {
    try {
      const response = await axios.get(`${API}/transaksi-nc`);
      setPesananList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pesanan data:", error);
      setMsg("Gagal memuat data pesanan");
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-CA");
  };

  const generateWeekDates = () => {
    const centerDate = new Date(filterDate);
    const dates = [];

    // Mulai dari 3 hari sebelumnya hingga 3 hari setelahnya
    for (let i = -3; i < 4; i++) {
      const date = new Date(centerDate);
      date.setDate(centerDate.getDate() + i);
      dates.push({
        date: date,
        dateString: date.toLocaleDateString("en-CA"),
        dayName: date.toLocaleDateString("id-ID", { weekday: 'long' })
      });
    }

    return dates;
  };

  const handleDateFilterChange = (dateString) => {
    // Jika dateString kosong dan sudah dalam mode showAllDates, kembalikan ke hari ini
    if (dateString === '' && showAllDates) {
      setFilterDate(getTodayDate());
      setShowAllDates(false);
      return;
    }

    // Set filter tanggal
    setFilterDate(dateString);
  };


  const handleUpdateTransaksi = async (id, updates) => {
    try {
      await axios.put(`${API}/transaksi-nc/${id}`, updates);
      fetchPesananData();
      // Tampilkan notifikasi
      setNotification({
        show: true,
        message: "Berhasil memperbarui pesanan",
        type: "success",
      });
      // Hilangkan notifikasi setelah 3 detik
      setTimeout(() => {
        setNotification({
          ...notification,
          show: false,
        });
      }, 3000);
    } catch (error) {
      console.error("Error updating transaksi:", error);
      setNotification({
        show: true,
        message: "Gagal memperbarui pesanan",
        type: "error",
      });
      setTimeout(() => {
        setNotification({
          ...notification,
          show: false,
        });
      }, 3000);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const togglePickupStatus = (id, checked) => {
    setPickupStatus((prev) => ({
      ...prev,
      [id]: checked,
    }));

    const pesanan = pesananList.find((p) => p.id_transaksi === id);
    if (pesanan) {
      // Saat pertama kali diubah, simpan status asli
      if (!originalPaymentStatus[id]) {
        setOriginalPaymentStatus((prev) => ({
          ...prev,
          [id]: pesanan.status_pembayaran,
        }));
      }

      // Jika dicentang, ubah ke SELESAI, jika tidak kembalikan ke status asli
      handleUpdateTransaksi(id, {
        ...pesanan,
        status_pembayaran: checked
          ? "Dijemput"
          : originalPaymentStatus[id] || "PENDING",
      });
    }
  };

  // Ganti dengan fungsi yang menggunakan status_kue dari database
  const updateCakeProcessStatus = async (id, status) => {
    try {
      const pesanan = pesananList.find((p) => p.id_transaksi === id);
      if (pesanan) {
        await axios.put(`${API}/transaksi-nc/${id}`, {
          ...pesanan,
          status_kue: status,
        });
        fetchPesananData();
        // Tampilkan notifikasi
        setNotification({
          show: true,
          message: "Status kue berhasil diperbarui",
          type: "success",
        });
        // Hilangkan notifikasi setelah 3 detik
        setTimeout(() => {
          setNotification({
            ...notification,
            show: false,
          });
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating cake status:", error);
      setNotification({
        show: true,
        message: "Gagal memperbarui status kue",
        type: "error",
      });
      setTimeout(() => {
        setNotification({
          ...notification,
          show: false,
        });
      }, 3000);
    }
  };

  // Fungsi untuk mendapatkan status kue dari database
  const getCustomCakeStatus = (pesanan) => {
    // Prioritaskan status_kue dari database
    if (pesanan.status_kue) {
      return pesanan.status_kue;
    }

    // Fallback jika status_kue tidak ada
    return "menunggu";
  };

  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "menunggu":
        return "bg-yellow-900 text-yellow-200";
      case "diproses":
        return "bg-blue-900 text-blue-200";
      case "selesai":
        return "bg-green-900 text-green-200";
      case "terlambat":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-900 text-gray-200";
    }
  };

  const renderBiayaTambahan = (item) => {
    if (!item.biaya_tambahan || item.biaya_tambahan.length === 0) return null;

    return (
        <div className="ml-4 text-sm text-[#B8A361]">
          <p className="font-semibold">Biaya Tambahan:</p>
          {item.biaya_tambahan.map((biaya, idx) => (
              <div key={idx} className="flex justify-between">
          <span>
            {biaya.nama_item} ({biaya.jumlah_item}x)
          </span>
                <span>
            Rp {(biaya.jumlah_item * biaya.harga_item).toLocaleString()}
          </span>
              </div>
          ))}
          <div className="font-semibold">
            Total Biaya Tambahan: Rp{" "}
            {item.total_biaya_tambahan?.toLocaleString() || "0"}
          </div>
        </div>
    );
  };

  const renderAdditionalItems = (additionalItems) => {
    if (!additionalItems || additionalItems.length === 0) return null;

    return (
        <div className="mt-2 text-[#B8A361]">
          <p className="font-semibold">Biaya Tambahan Lainnya:</p>
          {additionalItems.map((item, idx) => (
              <div key={idx} className="flex justify-between">
          <span>
            {item.nama} ({item.jumlah}x)
          </span>
                <span>Rp {(item.jumlah * item.harga).toLocaleString()}</span>
              </div>
          ))}
          <div className="font-semibold">
            Total: Rp{" "}
            {additionalItems
                .reduce((sum, item) => sum + item.jumlah * item.harga, 0)
                .toLocaleString()}
          </div>
        </div>
    );
  };

  const cetakLaporan = (pesanan) => {
    // Hitung tinggi yang dibutuhkan
    const calculateHeight = () => {
      let totalHeight = 0;

      // Header (logo, alamat, telp)
      totalHeight += 25;

      // Informasi transaksi (no struk, kasir, tanggal, jam)
      totalHeight += 25;

      // Header item
      totalHeight += 10;

      // Hitung tinggi untuk items
      pesanan.items.forEach((item) => {
        const itemName = item.jenis_kue || item.nama_produk;
        const nameLines = Math.ceil(itemName.length / 20); // 20 karakter per baris
        totalHeight += nameLines * 4 + 8; // tinggi teks + spacing
      });

      // Ringkasan pembayaran (subtotal, total, tunai, kembalian)
      totalHeight += 25;

      // Informasi pengambilan
      totalHeight += 15;

      // Footer (terima kasih dan catatan)
      totalHeight += 15;

      // Tambah margin atas dan bawah
      return totalHeight + 10;
    };

    const pageHeight = calculateHeight();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, calculateHeight(pesanan)],
    });

    // Fungsi helper format mata uang
    const formatCurrency = (amount) => {
      return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    // Fungsi helper posisi teks
    const centerText = (text, y) => {
      doc.text(text, 40, y, { align: "center" });
    };

    const rightText = (text, y) => {
      doc.text(text, 75, y, { align: "right" });
    };

    // Pengaturan font
    doc.setFont("courier", "normal");
    doc.setFontSize(8);

    // Header
    let yPos = 10;
    doc.setFontSize(12);
    centerText("NUR CAKE", yPos);

    yPos += 5;
    doc.setFontSize(8);
    centerText("Jln. Koto Panai, Air Haji", yPos);
    yPos += 5;
    centerText("Telp: +6282383353040", yPos);

    // Garis pemisah
    yPos += 3;
    doc.line(5, yPos, 75, yPos);

    // Informasi transaksi
    yPos += 7;
    doc.text(`No. Struk : ${pesanan.id_transaksi}`, 5, yPos);
    yPos += 5;
    doc.text(`Kasir    : Admin`, 5, yPos);
    yPos += 5;
    doc.text(`Tanggal  : ${formatDate(pesanan.tanggal_transaksi)}`, 5, yPos);
    yPos += 5;
    doc.text(`Jam      : ${new Date().toLocaleTimeString("id-ID")}`, 5, yPos);

    // Garis pemisah
    yPos += 3;
    doc.line(5, yPos, 75, yPos);

    // Header item
    yPos += 5;
    doc.text("Item", 5, yPos);
    doc.text("Qty", 50, yPos);
    doc.text("Total", 60, yPos);

    // Garis pemisah
    yPos += 2;
    doc.line(5, yPos, 75, yPos);

    // Daftar item dengan biaya tambahan
    yPos += 5;
    pesanan.items.forEach((item) => {
      const itemName = item.jenis_kue || item.nama_produk;
      const qty = item.jumlah || item.jumlah_pesanan;
      const total = item.harga_jual * qty;

      // Nama item dengan wrapping
      const splitName = doc.splitTextToSize(itemName, 40);
      doc.text(splitName, 5, yPos);
      yPos += splitName.length * 4;

      // Harga per item
      doc.text(`${formatCurrency(item.harga_jual)}`, 5, yPos);
      doc.text(`${qty}x`, 50, yPos);
      rightText(formatCurrency(total), yPos);

      yPos += 4;

      // Tampilkan biaya tambahan jika ada
      if (item.biaya_tambahan && item.biaya_tambahan.length > 0) {
        doc.text("Biaya Tambahan:", 5, yPos);
        yPos += 4;

        item.biaya_tambahan.forEach((biaya) => {
          const biayaText = `${biaya.nama_item} (${biaya.jumlah_item}x)`;
          const biayaTotal = biaya.jumlah_item * biaya.harga_item;
          doc.text(biayaText, 8, yPos);
          rightText(formatCurrency(biayaTotal), yPos);
          yPos += 4;
        });

        doc.text("Total Biaya Tambahan:", 5, yPos);
        rightText(formatCurrency(item.total_biaya_tambahan || 0), yPos);
        yPos += 6;
      }
    });

    // Tampilkan additional items jika ada
    if (pesanan.additional_items && pesanan.additional_items.length > 0) {
      doc.text("Biaya Tambahan Lainnya:", 5, yPos);
      yPos += 4;

      pesanan.additional_items.forEach((item) => {
        const itemText = `${item.nama} (${item.jumlah}x)`;
        const itemTotal = item.jumlah * item.harga;
        doc.text(itemText, 8, yPos);
        rightText(formatCurrency(itemTotal), yPos);
        yPos += 4;
      });

      const additionalTotal = pesanan.additional_items.reduce(
        (sum, item) => sum + item.jumlah * item.harga,
        0
      );
      doc.text("Total Biaya Tambahan Lainnya:", 5, yPos);
      rightText(formatCurrency(additionalTotal), yPos);
      yPos += 6;
    }

    // Garis pemisah subtotal
    doc.line(5, yPos, 75, yPos);
    yPos += 5;

    // Subtotal dan pembayaran
    doc.text("TOTAL", 5, yPos);
    rightText(formatCurrency(pesanan.total_harga), yPos);

    yPos += 5;
    doc.text("TUNAI", 5, yPos);
    rightText(formatCurrency(pesanan.jumlah_dibayar), yPos);

    yPos += 5;
    const kembalian = pesanan.jumlah_dibayar - pesanan.total_harga;
    doc.text("KEMBALI", 5, yPos);
    rightText(formatCurrency(kembalian), yPos);

    // Garis pemisah
    yPos += 3;
    doc.line(5, yPos, 75, yPos);

    // Informasi pengambilan
    yPos += 5;
    doc.text("Tanggal Ambil:", 5, yPos);
    rightText(formatDate(pesanan.tanggal_pengambilan), yPos);

    yPos += 5;
    doc.text("Jam Ambil:", 5, yPos);
    rightText(pesanan.waktu_pengambilan, yPos);

    // Footer
    yPos += 7;
    centerText("-- Terima Kasih --", yPos);
    yPos += 4;
    doc.setFontSize(6);
    centerText("Barang yang sudah dibeli tidak dapat dikembalikan", yPos);

    // Simpan PDF
    doc.save(`Struk_${pesanan.id_transaksi}_${pesanan.atas_nama}.pdf`);
  };

  const filteredPesananList = pesananList
      .filter((pesanan) => {
        const matchesSearch = pesanan.atas_nama
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesDate = filterDate
            ? new Date(pesanan.tanggal_pengambilan).toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta'
        }) === filterDate
            : true;

        const matchesStatus =
            filterStatus === "all"
                ? true
                : filterStatus === "Belum Lunas"
                    ? pesanan.status_pembayaran === "Belum Lunas"
                    : filterStatus === "Lunas"
                        ? pesanan.status_pembayaran === "Lunas"
                        : filterStatus === "Dijemput"
                            ? pesanan.status_pembayaran === "Dijemput"
                            : true;

        const matchesPickupStatus =
            filterPickupStatus === "all"
                ? true
                : filterPickupStatus === "dijemput"
                    ? pesanan.status_pengambilan === "Dijemput"
                    : filterPickupStatus === "belum_dijemput"
                        ? pesanan.status_pengambilan !== "Dijemput"
                        : true;

        return matchesSearch && matchesDate && matchesStatus && matchesPickupStatus;
      })
      .sort((a, b) => {
        // Prioritaskan pesanan dengan status pembayaran "Dijemput" ke bagian bawah
        if (a.status_pembayaran === "Dijemput" && b.status_pembayaran !== "Dijemput") {
          return 1;
        }
        if (b.status_pembayaran === "Dijemput" && a.status_pembayaran !== "Dijemput") {
          return -1;
        }

        return new Date(a.tanggal_transaksi) - new Date(b.tanggal_transaksi);
      });



  const TogglePickupStatus = ({ pesanan }) => {
    const isPickedUp = pickupStatus[pesanan.id_transaksi] || false;

    return (
        <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => togglePickupStatus(pesanan.id_transaksi, !isPickedUp)}
        >
          <div
              className={`
          w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out
          ${isPickedUp ? 'bg-[#B8A361]' : 'bg-[#8B7D3F]'}
        `}
          >
            <div
                className={`
            absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FAF3E0] 
            shadow-md transition-all duration-300 ease-in-out
            ${isPickedUp ? 'translate-x-6' : 'translate-x-1'}
          `}
            >
              {isPickedUp ? (
                  <Check className="w-4 h-4 text-[#B8A361] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              ) : (
                  <X className="w-4 h-4 text-[#8B7D3F] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>
        </div>
    );
  };


  return (
      // Buku Pesanan Kue
      <section className="bg-[#FAF3E0] py-16 px-5 min-h-screen w-full md:py-20 md:px-20 mt-4">
        {msg && (
            <div className="bg-[#B8A361] border border-[#8B7D3F] text-[#FAF3E0] px-4 py-3 rounded mb-4">
              {msg}
            </div>
        )}

        {notification.show && (
            <div
                className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 transform translate-y-0"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const startY = touch.clientY;
                  const handleTouchMove = (e) => {
                    const touch = e.touches[0];
                    const currentY = touch.clientY;
                    const diff = currentY - startY;

                    if (diff > 50) {
                      setNotification({...notification, show: false});
                      document.removeEventListener("touchmove", handleTouchMove);
                    }
                  };

                  document.addEventListener("touchmove", handleTouchMove);

                  document.addEventListener(
                      "touchend",
                      () => {
                        document.removeEventListener("touchmove", handleTouchMove);
                      },
                      {once: true}
                  );
                }}>
              <div
                  className={`px-6 py-3 rounded-b-lg shadow-lg flex items-center justify-between ${
                      notification.type === "success"
                          ? "bg-[#B8A361] text-[#FAF3E0]"
                          : "bg-[#8B7D3F] text-[#FAF3E0]"
                  }`}>
                <div className="flex items-center">
                  {notification.type === "success" ? (
                      <Check className="mr-2" size={18}/>
                  ) : (
                      <X className="mr-2" size={18}/>
                  )}
                  <span>{notification.message}</span>
                </div>
                <button
                    onClick={() => setNotification({...notification, show: false})}
                    className="ml-4 text-[#FAF3E0] hover:text-white">
                  <X size={18}/>
                </button>
              </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#8B7D3F]">
            Buku Pesanan NurCake
          </h1>
          <Link
              to="/pos-nc"
              className="bg-[#D4AF37] text-[#FAF3E0] px-4 py-2 rounded hover:bg-[#C5B358]">
            Tambah Pesanan
          </Link>
        </div>

        <div className="w-full bg-[#FFF8E7] rounded-lg p-2 space-y-2 mb-2 shadow-md">
          {/* Baris pertama: Pencarian dan Status */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-grow">
              <input
                  type="text"
                  placeholder="Cari nama pemesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-8 bg-[#FAF3E0] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#C5B358] text-[#8B7D3F] text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8A361]" size={18}/>
            </div>

            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-[#FAF3E0] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#C5B358] text-[#8B7D3F] text-sm min-w-[150px]"
            >
              <option value="all">Semua Status</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
              <option value="Dijemput">Dijemput</option>
            </select>
          </div>

          {/* Baris kedua: Filter Tanggal */}
          <div className="flex space-x-2 w-full overflow-x-auto pb-2">
            {/* Tombol Hari Ini */}
            <button
                onClick={() => handleDateFilterChange(getTodayDate())}
                className={`px-12 py-2 rounded-md text-xs transition-all duration-300 flex-shrink-0
            ${filterDate === getTodayDate()
                    ? 'bg-[#D4AF37] text-[#FAF3E0] shadow-md'
                    : 'text-[#8B7D3F] border border-[#D4AF37] hover:bg-[#FFF8E7]'}
          `}
            >
              Hari Ini
            </button>

            {/* Tombol Pilih Tanggal dengan Modal Modern */}
            <div className="relative flex-grow">
              <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`w-full px-3 py-2 rounded-md text-xs transition-all duration-300 flex items-center justify-center
              ${showDatePicker
                      ? 'bg-[#D4AF37] text-[#FAF3E0] shadow-md'
                      : 'text-[#8B7D3F] border border-[#D4AF37] hover:bg-[#FFF8E7]'}
            `}
              >
                <Search className="mr-2" size={16}/>
                {filterDate ? formatDate(filterDate) : 'Pilih Tanggal'}
              </button>

              {showDatePicker && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FFF8E7] rounded-lg p-6 border border-[#D4AF37] max-w-sm w-full">
                      <input
                          type="date"
                          value={filterDate}
                          onChange={(e) => {
                            handleDateFilterChange(e.target.value);
                            setShowDatePicker(false);
                          }}
                          className="w-full bg-[#FAF3E0] border border-[#D4AF37] rounded-md p-2 text-[#8B7D3F]"
                      />
                      <button
                          onClick={() => setShowDatePicker(false)}
                          className="mt-4 w-full bg-[#D4AF37] text-[#FAF3E0] py-2 rounded-md hover:bg-[#C5B358]"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
              )}
            </div>

            {/* Tombol Minggu Ini */}
            {!showAllDates && generateWeekDates().map((day, index) => (
                <button
                    key={index}
                    onClick={() => handleDateFilterChange(day.dateString)}
                    className={`flex-shrink-0 min-w-[50px] px-12 py-2 text-xs rounded-md transition-all duration-300
              ${filterDate === day.dateString
                        ? 'bg-[#D4AF37] text-[#FAF3E0] shadow-md'
                        : 'text-[#8B7D3F] border border-[#D4AF37] hover:bg-[#FFF8E7]'}
            `}
                >
                  <div className="flex flex-col items-center w-full">
                    <span className="font-bold uppercase text-xs">{day.dayName.slice(0, 3)}</span>
                    <span className="text-sm">{day.date.getDate()}</span>
                  </div>
                </button>
            ))}

            {/* Tombol Semua */}
            <button
                onClick={() => {
                  if (showAllDates) {
                    handleDateFilterChange('');
                  } else {
                    setShowAllDates(true);
                    handleDateFilterChange('');
                    setShowDatePicker(false);
                  }
                }}
                className={`flex-shrink-0 px-12 py-2 rounded-md text-xs transition-all duration-300 
            ${showAllDates
                    ? 'bg-[#D4AF37] text-[#FAF3E0] shadow-md'
                    : 'text-[#8B7D3F] border border-[#D4AF37] hover:bg-[#FFF8E7]'}
          `}
            >
              {showAllDates ? 'Tutup' : 'Semua'}
            </button>
          </div>
        </div>

        {loading ? (
            <div className="text-center py-4 text-[#8B7D3F]">Memuat...</div>
        ) : (
            <div className="bg-[#FFF8E7] rounded-lg shadow overflow-x-auto border border-[#D4AF37]">
              <table className="min-w-full">
                <thead>
                <tr className="bg-[#E6BE8A]">
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">
                    Tanggal Ambil
                  </th>
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">
                    Atas Nama
                  </th>
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">Pesanan</th>
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">
                    Status Bayar
                  </th>
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">
                    Status Kue
                  </th>
                  <th className="px-4 py-3 text-left text-[#8B7D3F] font-bold">Aksi</th>
                </tr>
                </thead>
                <tbody>
                {filteredPesananList.map((pesanan) => {
                  const hasCustomCake = pesanan.items.some(
                      (item) => item.tipe === "custom_cake"
                  );
                  return (
                      <tr
                          key={pesanan.id_transaksi}
                          className={`border-t border-[#E6BE8A]/30 ${
                              pickupStatus[pesanan.id_transaksi]
                                  ? "opacity-50"
                                  : ""
                          }`}>
                        <td className="px-4 py-3 text-[#8B7D3F]">
                          <div>
                    <span className="block text-xs text-[#B8A361]/70">
                      Transaksi: {formatDate(pesanan.tanggal_transaksi)}
                    </span>
                            <span className="block font-semibold">
                      {formatDate(pesanan.tanggal_pengambilan)}
                    </span>
                            <span className="block text-sm text-[#8B7D3F]">
                      Jam: {pesanan.waktu_pengambilan}
                    </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#8B7D3F]">
                          {pesanan.atas_nama}
                        </td>
                        <td className="px-4 py-3 text-[#8B7D3F]">
                          {pesanan.items.map((item, index) => (
                              <div key={index} className="mb-1">
                                {item.jenis_kue || item.nama_produk} -{" "}
                                {item.jumlah || item.jumlah_pesanan} x Rp
                                {item.harga_jual.toLocaleString()}
                              </div>
                          ))}
                          <div className="font-bold mt-2 text-right text-[#8B7D3F]">
                            Total: Rp {pesanan.total_harga.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                  <span
                      className={`px-2 py-1 rounded ${
                          pesanan.status_pembayaran === "Dijemput"
                              ? "bg-[#C5B358] text-[#FAF3E0]"
                              : "bg-[#E6BE8A] text-[#8B7D3F]"
                      }`}>
                    {pesanan.status_pembayaran}
                  </span>
                        </td>
                        <td className="px-4 py-3">
                          {hasCustomCake ? (
                              <div>
                                <select
                                    value={pesanan.status_kue || "menunggu"}
                                    onChange={(e) =>
                                        updateCakeProcessStatus(
                                            pesanan.id_transaksi,
                                            e.target.value
                                        )
                                    }
                                    className="w-full py-2 px-3 bg-[#FAF3E0] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#C5B358] text-[#8B7D3F]">
                                  <option value="menunggu">Menunggu</option>
                                  <option value="diproses">Diproses</option>
                                  <option value="selesai">Selesai</option>
                                </select>
                              </div>
                          ) : (
                              <span className="text-[#8B7D3F]">
                      Tidak ada kue request
                    </span>
                          )}
                        </td>
                        <td className="px-4 py-8 flex items-center space-x-2">
                          <button
                              onClick={() => setDetailLengkap(pesanan)}
                              className="bg-[#D4AF37] text-[#FAF3E0] px-3 py-1 rounded text-sm mr-2 hover:bg-[#C5B358]"
                              title="Lihat Detail Pesanan">
                            Detail
                          </button>
                          <TogglePickupStatus key={pesanan.id_transaksi} pesanan={pesanan}/>
                        </td>
                      </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
        )}

        {/* Modal Detail */}
        {detailLengkap && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-28 md:pt-12">
              <div
                  className="bg-[#FFF8E7] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-[#D4AF37]">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-6 pb-0">
                  <h2 className="text-2xl font-bold text-[#8B7D3F] mb-2 md:mb-0">
                    Detail Pesanan
                  </h2>
                  <button
                      onClick={() => cetakLaporan(detailLengkap)}
                      className="bg-[#D4AF37] text-[#FAF3E0] px-4 py-2 rounded flex items-center hover:bg-[#C5B358] w-full md:w-auto justify-center">
                    <Printer className="mr-2" size={18}/> Cetak Laporan
                  </button>
                </div>

                <div className="overflow-y-auto px-6 py-4 space-y-4 text-[#8B7D3F]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">ID Transaksi</p>
                      <p className="text-[#B8A361]">{detailLengkap.id_transaksi}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">
                        Tanggal Transaksi
                      </p>
                      <p className="text-[#B8A361]">
                        {formatDate(detailLengkap.tanggal_transaksi)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">
                        Metode Pembayaran
                      </p>
                      <p className="text-[#B8A361]">
                        {detailLengkap.metode_pembayaran}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">Nama Pemesan</p>
                      <p className="text-[#B8A361]">{detailLengkap.atas_nama}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">
                        Status Pembayaran
                      </p>
                      <p className="text-[#B8A361]">
                        {detailLengkap.status_pembayaran}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">Status Pesanan</p>
                      <p className="text-[#B8A361]">{detailLengkap.status_kue}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-[#8B7D3F] mb-2">
                      Detail Produk
                    </h3>
                    {detailLengkap.items.map((item, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span>{item.jenis_kue || item.nama_produk}</span>
                            <div className="flex items-center">
                      <span className="text-[#B8A361] mr-2">
                        ({item.jumlah || item.jumlah_pesanan}x)
                      </span>
                              <span>
                        Rp{" "}
                                {Number(
                                    item.harga_jual *
                                    (item.jumlah || item.jumlah_pesanan)
                                ).toLocaleString()}
                      </span>
                            </div>
                          </div>
                          {renderBiayaTambahan(item)}
                        </div>
                    ))}
                    {renderAdditionalItems(detailLengkap.additional_items)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">Total Harga</p>
                      <p className="text-[#B8A361]">Rp {Number(detailLengkap.total_harga).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">Jumlah Dibayar</p>
                      <p className="text-[#B8A361]">
                        Rp {Number(detailLengkap.jumlah_dibayar).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">
                        Tanggal Pengambilan
                      </p>
                      <p className="text-[#B8A361]">
                        {formatDate(detailLengkap.tanggal_pengambilan)}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B7D3F]">
                        Waktu Pengambilan
                      </p>
                      <p className="text-[#B8A361]">
                        {detailLengkap.waktu_pengambilan}
                      </p>
                    </div>
                  </div>

                  {detailLengkap.catatan && (
                      <div className="mb-4">
                        <p className="font-semibold text-[#8B7D3F]">Catatan</p>
                        <p className="text-[#B8A361]">{detailLengkap.catatan}</p>
                      </div>
                  )}
                </div>

                <div className="p-6 pt-0">
                  <button
                      onClick={() => setDetailLengkap(null)}
                      className="bg-[#D4AF37] text-[#FAF3E0] px-4 py-2 rounded w-full hover:bg-[#C5B358]">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
        )}

        {selectedPesanan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-[#FFF8E7] rounded-lg max-w-2xl w-full p-6">
                <h2 className="text-2xl font-bold mb-4 text-[#8B7D3F]">Detail Pesanan</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Nama Pemesan</p>
                    <p className="text-[#B8A361]">{selectedPesanan.atas_nama}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Status Pembayaran</p>
                    <p className="text-[#B8A361]">{selectedPesanan.status_pembayaran}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-[#8B7D3F] mb-2">Detail Produk</h3>
                  {selectedPesanan.items.map((item, index) => (
                      <div key={index} className="flex justify-between mb-1">
                <span className="text-[#8B7D3F]">
                  {item.jenis_kue} ({item.jumlah}x)
                </span>
                        <span className="text-[#B8A361]">
                  Rp {Number(item.harga_jual * item.jumlah).toLocaleString()}
                </span>
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Total Harga</p>
                    <p className="text-[#B8A361]">Rp {Number(selectedPesanan.total_harga).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Jumlah Dibayar</p>
                    <p className="text-[#B8A361]">
                      Rp {Number(selectedPesanan.jumlah_dibayar).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Tanggal Transaksi</p>
                    <p className="text-[#B8A361]">{formatDate(selectedPesanan.tanggal_transaksi)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#8B7D3F]">Tanggal & Waktu Pengambilan</p>
                    <p className="text-[#B8A361]">
                      {formatDate(selectedPesanan.tanggal_pengambilan)}{" "}
                      {selectedPesanan.waktu_pengambilan}
                    </p>
                  </div>
                </div>

                {selectedPesanan.catatan && (
                    <div className="mb-4">
                      <p className="font-semibold text-[#8B7D3F]">Catatan</p>
                      <p className="text-[#B8A361]">{selectedPesanan.catatan}</p>
                    </div>
                )}

                <button
                    onClick={() => setSelectedPesanan(null)}
                    className="bg-[#D4AF37] text-[#FAF3E0] px-4 py-2 rounded hover:bg-[#C5B358]">
                  Tutup
                </button>
              </div>
            </div>
        )}
      </section>
  );
};

export default BukuPesananNurCake;
