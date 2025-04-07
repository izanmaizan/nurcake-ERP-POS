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
} from "lucide-react";

const LacakPesananKue = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      const response = await axios.get("http://localhost:3000/transaksi-nc");
      const customCakeOrders = response.data.filter((transaksi) =>
        transaksi.items.some((item) => item.tipe === "custom_cake")
      );
      setOrders(customCakeOrders);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
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
        return "bg-yellow-100 text-yellow-800";
      case "diproses":
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "terlambat":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <p className="text-sm text-[#FFD700]">Spesifikasi</p>
          <div className="mt-2 space-y-2">
            <p className="flex items-center text-[#DAA520]">
              <Cake className="w-4 h-4 mr-2" />
              Jenis Kue: {customCakeItem.jenis_kue}
            </p>
            <p className="flex items-center text-[#DAA520]">
              <Package className="w-4 h-4 mr-2" />
              Ukuran: {customCakeItem.ukuran_kue}
            </p>
            <p className="flex items-center text-[#DAA520]">
              <Coffee className="w-4 h-4 mr-2" />
              Variasi: {customCakeItem.variasi_kue}
            </p>
            <p className="flex items-center text-[#DAA520]">
              <Box className="w-4 h-4 mr-2" />
              Kotak: {customCakeItem.kotak_kue}
            </p>
          </div>

          {customCakeItem.gambar_model?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[#FFD700] mb-2">Gambar Model</p>
                <div className="grid grid-cols-2 gap-4">
                  {customCakeItem.gambar_model.map((src, index) => (
                      <img
                          key={index}
                          src={`http://localhost:3000/${src}`}
                          alt={`gambar-model-${index}`}
                          onClick={() => setPreviewImage(`http://localhost:3000/${src}`)}
                          className="w-full h-32 object-cover rounded-lg border border-[#DAA520] cursor-pointer hover:scale-105 transition-transform"
                      />
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
        `http://localhost:3000/transaksi-nc/${selectedOrder.id_transaksi}`,
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
        <div className="mt-6">
          <p className="text-sm text-[#FFD700] mb-2">Detail Item Tambahan</p>
          <ul className="space-y-2">
            {combined.map((item, idx) => (
                <li key={idx} className="text-[#DAA520]">
                  - {item.jumlah} x {item.nama ? ` (${item.nama}) = ` : ""}
                  {formatPrice(item.harga)}
                </li>
            ))}
          </ul>
        </div>
    );
  };


  return (
    // LacakPesananKue
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="min-h-screen bg-[#1a1a1a]">
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#FFD700] mb-4">
              Lacak Pesanan Kue
            </h1>
            <p className="text-[#DAA520]">
              Pantau status pesanan kue Anda dengan mudah
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Orders List */}
            <div className="lg:w-1/2">
              {/* Search and Filter Section */}
              <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 mb-6 border border-[#FFD700]">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari pesanan berdasarkan nama atau jenis kue..."
                      className="w-full pl-10 pr-4 py-3 bg-[#3d3d3d] border border-[#FFD700] rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent text-[#FFD700] placeholder-[#DAA520]"
                    />
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-[#DAA520]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full py-2 px-3 bg-[#3d3d3d] border border-[#FFD700] rounded-lg focus:ring-2 focus:ring-[#DAA520] text-[#FFD700]"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full py-2 px-3 bg-[#3d3d3d] border border-[#FFD700] rounded-lg focus:ring-2 focus:ring-[#DAA520] text-[#FFD700]">
                      <option value="all">Semua Status</option>
                      <option value="menunggu">Menunggu</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-[#2d2d2d] rounded-xl shadow-lg border border-[#FFD700]">
                    <Package className="mx-auto h-12 w-12 text-[#DAA520]" />
                    <p className="mt-4 text-[#DAA520]">
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
                        onClick={() => setSelectedOrder(order)}
                        className={`bg-[#2d2d2d] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-[#FFD700] ${
                          selectedOrder?.id_transaksi === order.id_transaksi
                            ? "ring-2 ring-[#DAA520]"
                            : ""
                        }`}>
                        <div className="p-6">
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold text-[#FFD700]">
                                {order.atas_nama}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  orderStatus
                                )}`}>
                                {orderStatus.charAt(0).toUpperCase() +
                                  orderStatus.slice(1)}
                              </span>
                            </div>
                            {customCakeItem && (
                              <p className="text-[#DAA520]">
                                {customCakeItem.jenis_kue} -{" "}
                                {customCakeItem.variasi_kue}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-[#DAA520]">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Pesanan:{" "}
                                {formatDateTime(order.tanggal_transaksi)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Pengambilan:{" "}
                                {formatDateTime(order.tanggal_pengambilan)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-[#FFD700]">
                                {formatPrice(order.total_harga)}
                              </p>
                              <ArrowRight className="w-5 h-5 text-[#DAA520]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Side - Order Details */}
            <div className="lg:w-1/2">
              {selectedOrder ? (
                <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 sticky top-8 border border-[#FFD700]">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-[#DAA520]">
                      <div>
                        <h2 className="text-2xl font-bold text-[#FFD700]">
                          Detail Pesanan
                        </h2>
                        <p className="text-sm text-[#DAA520] mt-1">
                          Order ID #{selectedOrder.id_transaksi}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedOrder.status_pembayaran
                          )}`}>
                          {selectedOrder.status_pembayaran}
                        </span>
                        <select
                          value={
                            selectedOrder.status_kue ||
                            getCustomCakeStatus(selectedOrder)
                          }
                          onChange={(e) =>
                            handleUpdateOrderStatus(e.target.value)
                          }
                          className="w-auto py-2 px-4 bg-[#3d3d3d] border border-[#FFD700] rounded-lg text-sm font-medium text-[#FFD700] hover:bg-[#2d2d2d] transition-colors">
                          <option value="menunggu">Menunggu</option>
                          <option value="diproses">Diproses</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-[#DAA520]">Nama Pelanggan</p>
                        <p className="font-medium text-[#FFD700]">
                          {selectedOrder.atas_nama}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#DAA520]">Total Harga</p>
                        <p className="font-medium text-[#FFD700]">
                          {formatPrice(selectedOrder.total_harga)}
                        </p>
                      </div>
                    </div>

                    {renderCustomCakeDetails(selectedOrder)}
                    {renderAdditionalItems(selectedOrder)}

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#DAA520]">Catatan</p>
                        <p className="font-medium text-[#FFD700]">
                          {selectedOrder.catatan || "-"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-[#DAA520]">
                            Tanggal Pemesanan
                          </p>
                          <p className="font-medium text-[#FFD700]">
                            {formatDateTime(selectedOrder.tanggal_transaksi)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#DAA520]">
                            Tanggal Pengambilan
                          </p>
                          <p className="font-medium text-[#FFD700]">
                            {formatDateTime(selectedOrder.tanggal_pengambilan)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-[#DAA520]">
                        Metode Pembayaran
                      </p>
                      <p className="font-medium text-[#FFD700]">
                        {selectedOrder.metode_pembayaran}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#DAA520]">
                        Detail Item Tambahan
                      </p>
                      {selectedOrder.additional_items &&
                      selectedOrder.additional_items.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {selectedOrder.additional_items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center text-[#FFD700]">
                              <span className="w-2 h-2 bg-[#DAA520] rounded-full mr-2"></span>
                              {item.nama_produk} - {item.jumlah} x{" "}
                              {formatPrice(item.harga_jual)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[#DAA520]">
                          Tidak ada item tambahan
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-12 text-center border border-[#FFD700]">
                  <Package className="mx-auto h-16 w-16 text-[#DAA520]" />
                  <p className="mt-4 text-[#DAA520]">
                    Pilih pesanan untuk melihat detail
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewImage && (
          <div
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          >
            <img
                src={previewImage}
                alt="Preview Gambar"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
      )}

    </section>
  );
};

export default LacakPesananKue;
