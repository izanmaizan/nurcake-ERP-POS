import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Clock,
  Package,
  Calendar,
  Coffee,
  Cake,
  Box,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  X
} from "lucide-react";

// Tetap mempertahankan warna tema krem/emas
const COLORS = {
  primary: "#D4AF37",    // Emas utama
  secondary: "#C5B358",  // Emas sekunder
  accent: "#E6BE8A",     // Emas muda/aksen
  bgColor: "#FAF3E0",    // Krem muda/background utama
  textColor: "#8B7D3F",  // Emas gelap untuk teks
  secondaryTextColor: "#B8A361", // Emas sedang untuk teks sekunder
  cardBgColor: "#FFF8E7", // Krem sangat muda untuk kartu
  borderColor: "#D4AF37"  // Warna border
};

const API = import.meta.env.VITE_API; // Konstanta untuk API

const LacakPesananKue = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderList, setShowOrderList] = useState(true);

  // Fungsi untuk mengecek jika layar mobile
  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    fetchTransaksi();

    // Toggle view pada mobile saat memilih pesanan
    const handleResize = () => {
      if (selectedOrder && isMobile()) {
        setShowOrderList(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTransaksi = async () => {
    try {
      const response = await axios.get(`${API}/transaksi-nc`);
      const customCakeOrders = response.data.filter((transaksi) =>
          transaksi.items.some((item) => item.tipe === "custom_cake")
      );
      setOrders(customCakeOrders);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    if (isMobile()) {
      setShowOrderList(false); // Sembunyikan daftar pesanan pada mobile saat detail dibuka
    }
  };

  const handleBackToList = () => {
    if (isMobile()) {
      setShowOrderList(true);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  };

  const getCustomCakeStatus = (order) => {
    // Prioritaskan status_kue dari database jika sudah diset
    if (order.status_kue) {
      return order.status_kue;
    }

    // Logika sebelumnya sebagai fallback
    const currentDate = new Date();
    const pickupDate = new Date(order.tanggal_pengambilan);

    currentDate.setHours(0, 0, 0, 0);
    pickupDate.setHours(0, 0, 0, 0);

    if (order.status_pembayaran.toLowerCase() === "lunas") {
      return "selesai";
    } else if (order.status_pembayaran.toLowerCase() === "proses") {
      return "diproses";
    } else if (currentDate < pickupDate) {
      return "menunggu";
    } else if (currentDate.getTime() === pickupDate.getTime()) {
      return "menunggu";
    }

    return "terlambat";
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "menunggu":
        return "bg-yellow-50 text-amber-800";
      case "diproses":
        return "bg-blue-50 text-blue-800";
      case "selesai":
        return "bg-green-50 text-green-800";
      case "terlambat":
        return "bg-red-50 text-red-800";
      default:
        return "bg-gray-50 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customCakeItem = order.items.find(
        (item) => item.tipe === "custom_cake"
    );
    const matchesSearch =
        customCakeItem?.jenis_kue
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
        order.atas_nama.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
        filterStatus === "all" ||
        getCustomCakeStatus(order).toLowerCase() === filterStatus;

    const matchesDate =
        !filterDate ||
        (() => {
          const pickupDate = new Date(order.tanggal_pengambilan);
          pickupDate.setDate(pickupDate.getDate() + 1);
          return pickupDate.toISOString().split("T")[0] === filterDate;
        })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const renderCustomCakeDetails = (order) => {
    const customCakeItem = order.items.find((item) => item.tipe === "custom_cake");

    return customCakeItem ? (
        <>
          <p className="text-sm font-medium text-[#8B7D3F]">Spesifikasi</p>
          <div className="mt-2 space-y-2">
            <p className="flex items-center text-[#B8A361]">
              <Cake className="w-4 h-4 mr-2" />
              Jenis Kue: {customCakeItem.jenis_kue}
            </p>
            <p className="flex items-center text-[#B8A361]">
              <Package className="w-4 h-4 mr-2" />
              Ukuran: {customCakeItem.ukuran_kue}
            </p>
            <p className="flex items-center text-[#B8A361]">
              <Coffee className="w-4 h-4 mr-2" />
              Variasi: {customCakeItem.variasi_kue}
            </p>
            <p className="flex items-center text-[#B8A361]">
              <Box className="w-4 h-4 mr-2" />
              Kotak: {customCakeItem.kotak_kue}
            </p>
          </div>

          {customCakeItem.gambar_model?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#8B7D3F] mb-2">Gambar Model</p>
                <div className="grid grid-cols-2 gap-3">
                  {customCakeItem.gambar_model.map((src, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                            src={`${API}/${src}`}
                            alt={`gambar-model-${index}`}
                            onClick={() => setPreviewImage(`${API}/${src}`)}
                            className="w-full h-full object-cover rounded-lg border border-[#D4AF37] cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      </div>
                  ))}
                </div>
              </div>
          )}
        </>
    ) : null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    try {
      await axios.put(
          `${API}/transaksi-nc/${selectedOrder.id_transaksi}`,
          {
            ...selectedOrder,
            status_kue: newStatus,
          }
      );

      fetchTransaksi();

      // Update selected order immediately
      setSelectedOrder((prevOrder) => ({
        ...prevOrder,
        status_kue: newStatus,
      }));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Gagal memperbarui status pesanan");
    }
  };

  const renderAdditionalItems = (order) => {
    // Gabungkan semua biaya tambahan dari items dan additional_items
    const fromItems = order.items
        .flatMap((item) => item.biaya_tambahan || [])
        .map((item) => ({
          nama: item.nama_item,
          jumlah: item.jumlah_item,
          harga: Number(item.harga_item),
        }));

    const fromAdditional = (order.additional_items || []).map((item) => ({
      nama: item.nama,
      jumlah: item.jumlah,
      harga: Number(item.harga),
    }));

    const combined = [...fromItems, ...fromAdditional];

    if (combined.length === 0) return null;

    return (
        <div className="mt-5">
          <p className="text-sm font-medium text-[#8B7D3F] mb-2">Detail Item Tambahan</p>
          <ul className="space-y-2">
            {combined.map((item, idx) => (
                <li key={idx} className="text-[#B8A361]">
                  - {item.jumlah} x {item.nama ? ` (${item.nama}) = ` : ""}
                  {formatPrice(item.harga)}
                </li>
            ))}
          </ul>
        </div>
    );
  };

  return (
      <section className="bg-[#FAF3E0] py-6 px-3 md:py-12 md:px-6 lg:py-16 lg:px-10 mt-16 md:mt-12 min-h-screen">
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#8B7D3F] mb-2">
              Lacak Pesanan Kue
            </h1>
            <p className="text-sm md:text-base text-[#B8A361]">
              Pantau status pesanan kue Anda dengan mudah
            </p>
          </div>

          {/* Mobile View - Back button */}
          {isMobile() && selectedOrder && !showOrderList && (
              <button
                  onClick={handleBackToList}
                  className="mb-4 flex items-center text-[#8B7D3F] font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180 mr-1" />
                Kembali ke daftar pesanan
              </button>
          )}

          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left Side - Orders List (Hidden on mobile when viewing details) */}
            {(showOrderList || !isMobile()) && (
                <div className="lg:w-1/2">
                  {/* Search Section */}
                  <div className="bg-[#FFF8E7] rounded-xl shadow-md p-4 mb-5 border border-[#D4AF37]">
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pesanan..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3E0] border border-[#C5B358] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-[#8B7D3F] placeholder-[#B8A361]"
                        />
                        <Search className="absolute left-3 top-3 h-5 w-5 text-[#B8A361]" />
                      </div>

                      {/* Filter Toggle Button */}
                      <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center justify-between w-full py-2 px-3 bg-[#FAF3E0] border border-[#C5B358] rounded-lg text-[#8B7D3F]"
                      >
                        <div className="flex items-center">
                          <Filter className="w-4 h-4 mr-2" />
                          <span>Filter</span>
                        </div>
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Expandable Filters */}
                      {showFilters && (
                          <div className="grid grid-cols-1 gap-3 pt-2 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-xs text-[#B8A361]">Tanggal Pengambilan</label>
                              <input
                                  type="date"
                                  value={filterDate}
                                  onChange={(e) => setFilterDate(e.target.value)}
                                  className="w-full py-2 px-3 bg-[#FAF3E0] border border-[#C5B358] rounded-lg focus:ring-2 focus:ring-[#D4AF37] text-[#8B7D3F]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-[#B8A361]">Status Pesanan</label>
                              <select
                                  value={filterStatus}
                                  onChange={(e) => setFilterStatus(e.target.value)}
                                  className="w-full py-2 px-3 bg-[#FAF3E0] border border-[#C5B358] rounded-lg focus:ring-2 focus:ring-[#D4AF37] text-[#8B7D3F]">
                                <option value="all">Semua Status</option>
                                <option value="menunggu">Menunggu</option>
                                <option value="diproses">Diproses</option>
                                <option value="selesai">Selesai</option>
                              </select>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pb-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-10 bg-[#FFF8E7] rounded-xl shadow-md border border-[#D4AF37]">
                          <Package className="mx-auto h-10 w-10 text-[#B8A361]" />
                          <p className="mt-3 text-[#B8A361]">
                            Tidak ada pesanan kue ditemukan.
                          </p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                          const customCakeItem = order.items.find(
                              (item) => item.tipe === "custom_cake"
                          );
                          const orderStatus = getCustomCakeStatus(order);
                          return (
                              <div
                                  key={order.id_transaksi}
                                  onClick={() => handleSelectOrder(order)}
                                  className={`bg-[#FFF8E7] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer border border-[#D4AF37] ${
                                      selectedOrder?.id_transaksi === order.id_transaksi
                                          ? "ring-2 ring-[#C5B358]"
                                          : ""
                                  }`}>
                                <div className="p-4">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-base font-semibold text-[#8B7D3F] truncate max-w-[70%]">
                                        {order.atas_nama}
                                      </h3>
                                      <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                              orderStatus
                                          )}`}>
                                  {orderStatus.charAt(0).toUpperCase() +
                                      orderStatus.slice(1)}
                                </span>
                                    </div>
                                    {customCakeItem && (
                                        <p className="text-[#B8A361] text-sm truncate">
                                          {customCakeItem.jenis_kue} - {customCakeItem.variasi_kue}
                                        </p>
                                    )}
                                    <div className="flex flex-col space-y-1 text-xs text-[#B8A361]">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatDateTime(order.tanggal_transaksi).split(' ')[0]}
                                  </span>
                                </span>
                                      <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatDateTime(order.tanggal_pengambilan).split(' ')[0]}
                                  </span>
                                </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                      <p className="text-sm font-semibold text-[#8B7D3F]">
                                        {formatPrice(order.total_harga)}
                                      </p>
                                      <ArrowRight className="w-4 h-4 text-[#B8A361]" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                          );
                        })
                    )}
                  </div>
                </div>
            )}

            {/* Right Side - Order Details (Full width on mobile when viewing details) */}
            {(selectedOrder && (!showOrderList || !isMobile())) || !isMobile() ? (
                <div className={`${isMobile() ? 'w-full' : 'lg:w-1/2'}`}>
                  {selectedOrder ? (
                      <div className="bg-[#FFF8E7] rounded-xl shadow-md p-4 md:p-5 border border-[#D4AF37]">
                        <div className="space-y-5">
                          <div className="flex flex-col pb-3 border-b border-[#E6BE8A]">
                            <div className="flex justify-between items-center">
                              <div>
                                <h2 className="text-lg font-bold text-[#8B7D3F]">
                                  Detail Pesanan
                                </h2>
                                <p className="text-xs text-[#B8A361] mt-0.5">
                                  Order ID #{selectedOrder.id_transaksi}
                                </p>
                              </div>
                              <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      selectedOrder.status_pembayaran
                                  )}`}>
                            {selectedOrder.status_pembayaran}
                          </span>
                            </div>
                            <div className="mt-3">
                              <label className="text-xs text-[#B8A361] block mb-1">Status Pesanan:</label>
                              <select
                                  value={
                                      selectedOrder.status_kue ||
                                      getCustomCakeStatus(selectedOrder)
                                  }
                                  onChange={(e) =>
                                      handleUpdateOrderStatus(e.target.value)
                                  }
                                  className="w-full py-2 px-3 bg-[#FAF3E0] border border-[#C5B358] rounded-lg text-xs font-medium text-[#8B7D3F] hover:bg-[#FFF8E7] transition-colors">
                                <option value="menunggu">Menunggu</option>
                                <option value="diproses">Diproses</option>
                                <option value="selesai">Selesai</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-[#B8A361]">Nama Pelanggan</p>
                                <p className="font-medium text-[#8B7D3F] text-sm">
                                  {selectedOrder.atas_nama}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#B8A361]">Total Harga</p>
                                <p className="font-medium text-[#8B7D3F] text-sm">
                                  {formatPrice(selectedOrder.total_harga)}
                                </p>
                              </div>
                            </div>

                            {renderCustomCakeDetails(selectedOrder)}

                            <div className="pt-2">
                              <p className="text-xs text-[#B8A361]">Catatan</p>
                              <p className="font-medium text-[#8B7D3F] text-sm mt-1">
                                {selectedOrder.catatan || "-"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-[#B8A361]">
                                  Tanggal Pemesanan
                                </p>
                                <p className="font-medium text-[#8B7D3F] text-sm mt-1">
                                  {formatDateTime(selectedOrder.tanggal_transaksi)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#B8A361]">
                                  Tanggal Pengambilan
                                </p>
                                <p className="font-medium text-[#8B7D3F] text-sm mt-1">
                                  {formatDateTime(selectedOrder.tanggal_pengambilan)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-[#B8A361]">
                                Metode Pembayaran
                              </p>
                              <p className="font-medium text-[#8B7D3F] text-sm mt-1">
                                {selectedOrder.metode_pembayaran}
                              </p>
                            </div>

                            {renderAdditionalItems(selectedOrder)}
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="bg-[#FFF8E7] rounded-xl shadow-md p-8 text-center border border-[#D4AF37]">
                        <Package className="mx-auto h-12 w-12 text-[#B8A361]" />
                        <p className="mt-3 text-[#B8A361]">
                          Pilih pesanan untuk melihat detail
                        </p>
                      </div>
                  )}
                </div>
            ) : null}
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
            <div
                onClick={() => setPreviewImage(null)}
                className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
            >
              <img
                  src={previewImage}
                  alt="Preview Gambar"
                  className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(null);
                  }}
                  className="absolute top-4 right-4 bg-[#FFF8E7] rounded-full p-1 text-[#8B7D3F] hover:bg-[#D4AF37] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
        )}
      </section>
  );
};

export default LacakPesananKue;