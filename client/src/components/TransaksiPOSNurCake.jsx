// TransaksiPOSNurCake
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Trash2, Save, Plus, Printer } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import { jsPDF } from "jspdf";

const TransaksiPOSNurCake = ({
  totalHarga,
  setTotalHarga,
  selectedProduk,
  onTotalChange,
  handleJumlahProdukChange,
  handleRemoveProduk,
  handleJualProduk,
  tanggalTransaksi,
  tanggalPengambilan,
  handleTanggalTransaksiChange,
  handleTanggalPengambilanChange,
  triggerKueReadyRefresh
}) => {
  const [metodePembayaran, setMetodePembayaran] = useState("cash");
  const [jumlahDibayar, setJumlahDibayar] = useState(0);
  const [statusPembayaran, setStatusPembayaran] = useState("");
  const [kembalian, setKembalian] = useState(0);
  const [sisaHutang, setSisaHutang] = useState(0);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNameError, setCustomerNameError] = useState(false);

  const [showCakeDetails, setShowCakeDetails] = useState(false);
  const [selectedCakeDetails, setSelectedCakeDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Tambahkan state baru untuk Dialog konfirmasi
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] =
    useState(false);

  const handleShowDetails = (item) => {
    setSelectedItemDetails(item);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // State for new additional item form
  const [newItem, setNewItem] = useState({ nama: "", jumlah: 1, harga: 0 });
  // Ubah state pickupTime untuk menggunakan jam saat ini sebagai nilai default
  const [pickupTime, setPickupTime] = useState(getCurrentTime());

  useEffect(() => {
    setPickupTime(getCurrentTime());
  }, []);

  const calculateTotal = () => {
    // Calculate products total
    const productsTotal = selectedProduk.reduce((sum, item) => {
      // 1. Penanganan untuk Custom Cake
      if (item.tipe === "custom_cake") {
        // Custom cake sudah memiliki total_harga yang include jumlah pesanan dan biaya tambahan
        const totalHargaCustom = Number(item.total_harga) || 0;
        console.log("Total Harga Custom Cake:", totalHargaCustom);
        return sum + totalHargaCustom;
      }

      // 2. Penanganan untuk Kue Ready
      if (item.id_kue) {
        // Kue ready selalu memiliki jumlah 1, jadi langsung gunakan harga_jual
        const hargaKueReady = Number(item.harga_jual) || 0;
        console.log("Harga Kue Ready:", hargaKueReady);
        return sum + hargaKueReady;
      }

      // 3. Penanganan untuk Produk Reguler
      if (item.id_produk) {
        // Produk reguler perlu dikalikan dengan jumlah
        const hargaProduk = Number(item.harga_jual) || 0;
        const jumlahProduk = Number(item.jumlah) || 0;
        const totalProdukReguler = hargaProduk * jumlahProduk;
        console.log(
          "Total Produk Reguler:",
          totalProdukReguler,
          "Harga:",
          hargaProduk,
          "Jumlah:",
          jumlahProduk
        );
        return sum + totalProdukReguler;
      }

      // Jika tidak masuk kategori manapun, return sum tanpa perubahan
      console.warn("Item tidak teridentifikasi:", item);
      return sum;
    }, 0);

    // Calculate additional items total
    const additionalTotal = additionalItems.reduce((sum, item) => {
      const harga = Number(item.harga) || 0;
      const jumlah = Number(item.jumlah) || 0;
      const totalTambahan = harga * jumlah;
      console.log(
        "Total Item Tambahan:",
        totalTambahan,
        "Harga:",
        harga,
        "Jumlah:",
        jumlah
      );
      return sum + totalTambahan;
    }, 0);

    // Calculate final total
    const finalTotal = productsTotal + additionalTotal;
    console.log(
      "Total Akhir:",
      finalTotal,
      "Products Total:",
      productsTotal,
      "Additional Total:",
      additionalTotal
    );

    // Update both local state and parent component
    setTotalHarga(finalTotal);
    if (onTotalChange) {
      onTotalChange(finalTotal);
    }

    return finalTotal;
  };

  useEffect(() => {
    calculateTotal();
  }, [selectedProduk, additionalItems]);

  useEffect(() => {
    hitungPembayaran();
  }, [jumlahDibayar, totalHarga, metodePembayaran]);

  const getTotalWithAdditional = () => {
    return calculateTotal();
  };

  const hitungPembayaran = () => {
    const total = getTotalWithAdditional();

    if (jumlahDibayar > total) {
      setKembalian(metodePembayaran === "cash" ? jumlahDibayar - total : 0);
      setStatusPembayaran("Berlebih");
      setSisaHutang(0);
    } else if (jumlahDibayar < total) {
      setKembalian(0);
      // Ubah status sesuai metode pembayaran saat kurang bayar
      setStatusPembayaran(
        metodePembayaran === "cash" ? "Belum Lunas" : "Kurang"
      );
      setSisaHutang(total - jumlahDibayar);
    } else {
      setKembalian(0);
      setStatusPembayaran("Lunas");
      setSisaHutang(0);
    }

    if (metodePembayaran === "transfer" && jumlahDibayar > total) {
      setKembalian(0);
    }
  };

  const handleAddAdditionalItem = () => {
    if (newItem.nama && newItem.harga > 0) {
      setAdditionalItems([...additionalItems, { ...newItem }]);
      setNewItem({ nama: "", jumlah: 1, harga: 0 });
    }
  };

  const handleRemoveAdditionalItem = (index) => {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index));
  };

  // Modifikasi fungsi handleSimpanPesanan
  const handleSimpanPesanan = async () => {
    // Validasi nama pelanggan terlebih dahulu
    if (!customerName.trim()) {
      setCustomerNameError(true);
      // Scroll ke elemen input nama pelanggan
      const customerNameInput = document.getElementById("customer-name-input");
      if (customerNameInput) {
        customerNameInput.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        customerNameInput.focus();
      }

      // Hapus efek error setelah 3 detik
      setTimeout(() => {
        setCustomerNameError(false);
      }, 3000);

      return;
    }

    // Reset error jika ada
    setCustomerNameError(false);

    // Cek jika metode pembayaran cash dan kurang bayar
    if (
      metodePembayaran === "cash" &&
      jumlahDibayar < getTotalWithAdditional()
    ) {
      setShowConfirmPaymentDialog(true);
      return;
    }

    // Jika tidak kurang bayar atau modal sudah dikonfirmasi, lanjutkan proses simpan
    simpanPesanan();
  };

  // Fungsi untuk menyimpan pesanan (dipindahkan dari handleSimpanPesanan)
  const simpanPesanan = async () => {
    try {
      const formattedItems = selectedProduk.map((item) => {
        // Untuk kue request/custom cake
        if (item.tipe === "custom_cake") {
          return {
            id_custom: item.id_custom,
            jenis_kue: item.jenis_kue,
            variasi_kue: item.variasi_kue,
            ukuran_kue: item.ukuran_kue,
            kotak_kue: item.kotak_kue,
            modal: item.modal, // Modal per item
            harga_jual: item.harga_jual, // Harga jual per item
            total_modal: item.total_modal, // Total modal setelah dikalikan jumlah
            total_harga: item.total_harga, // Total harga setelah dikalikan jumlah
            jumlah_pesanan: item.jumlah_pesanan,
            biaya_tambahan: item.biaya_tambahan,
            total_biaya_tambahan: item.total_biaya_tambahan,
            tipe: "custom_cake",
          };
        }

        // Untuk kue ready
        if (item.id_kue) {
          const total_modal = item.modal_pembuatan;
          const total_harga = item.harga_jual;

          return {
            id_kue: item.id_kue,
            jenis_kue: item.jenis_kue,
            modal_pembuatan: item.modal_pembuatan, // Modal per item
            harga_jual: item.harga_jual, // Harga jual per item
            total_modal: total_modal,
            total_harga: total_harga,
            jumlah: 1,
            nama_kue: item.cake_name || item.jenis_kue,
            tipe: "kue_ready",
          };
        }

        // Untuk produk reguler
        const total_modal = (item.modal_produk || 0) * item.jumlah;
        const total_harga = (item.harga_jual || 0) * item.jumlah;

        return {
          id_produk: item.id_produk,
          nama_produk: item.nama_produk,
          modal_produk: item.modal_produk, // Modal per item
          harga_jual: item.harga_jual, // Harga jual per item
          jumlah: item.jumlah,
          total_modal: total_modal,
          total_harga: total_harga,
          tipe: "produk_reguler",
        };
      });

      const transaksiData = {
        tanggal_transaksi: tanggalTransaksi,
        tanggal_pengambilan: tanggalPengambilan,
        waktu_pengambilan: pickupTime,
        total_harga: getTotalWithAdditional(),
        metode_pembayaran: metodePembayaran,
        jumlah_dibayar: jumlahDibayar,
        status_pembayaran: statusPembayaran,
        atas_nama: customerName,
        catatan: notes,
        items: formattedItems,
        additional_items: additionalItems,
      };

      const response = await axios.post(
        "http://localhost:3000/transaksi-nc",
        transaksiData
      );

      // Setelah transaksi berhasil, hapus kue ready dari database
      // for (const item of selectedProduk) {
      //   if (item.id_kue) {
      //     // Hapus kue ready dari database
      //     await axios.delete(`http://localhost:3000/kue-ready/${item.id_kue}`);
      //   }
      // }

      // Perbarui tampilan daftar kue ready setelah menghapus
      if (triggerKueReadyRefresh) {
        triggerKueReadyRefresh();
      }

      // Cetak struk otomatis setelah transaksi berhasil
      cetakLaporan({
        ...transaksiData,
        id_transaksi: response.data.id_transaksi,
      });

      alert("Transaksi berhasil disimpan dan struk sedang dicetak!");
      handleJualProduk();
    } catch (error) {
      console.error("Error saat menyimpan pesanan:", error);
      alert("Gagal menyimpan pesanan");
    }
  };

  const handleRemoveItem = (item) => {
    if (item.id_kue) {
      handleRemoveProduk(item.id_kue, "kue_ready");
    } else {
      handleRemoveProduk(item.id_produk, "produk_reguler");
    }
  };

  const renderTableRow = (item) => {
    const isKueReady = Boolean(item.id_kue);
    const isCustomCake = Boolean(item.id_custom);
    let itemName, itemId, quantity, subtotal, basePrice, additionalInfo;

    if (isCustomCake) {
      itemName = `Custom Cake - ${item.jenis_kue}`;
      itemId = item.id_custom;
      quantity = item.jumlah_pesanan;
      basePrice = item.harga_jual;
      subtotal = item.total_harga;

      // Menghitung total item biaya tambahan
      const totalAdditionalItems = item.biaya_tambahan.reduce(
        (sum, tambahan) => sum + Number(tambahan.jumlah_item),
        0
      );

      // Format quantity dengan biaya tambahan
      additionalInfo = {
        quantity:
          totalAdditionalItems > 0
            ? `${quantity} (+${totalAdditionalItems} Biaya Tambahan)`
            : quantity,
        price:
          item.total_biaya_tambahan > 0
            ? `Rp ${basePrice.toLocaleString()} + Rp ${item.total_biaya_tambahan.toLocaleString()} (Biaya Tambahan)`
            : `Rp ${basePrice.toLocaleString()}`,
      };
    } else if (isKueReady) {
      itemName = `${item.jenis_kue}${item.cake_name ? ` - "${item.cake_name}"` : ""}`;
      itemId = item.id_kue;
      quantity = 1;
      basePrice = item.harga_jual;
      subtotal = item.harga_jual;
      additionalInfo = {
        quantity: quantity,
        price: `Rp ${basePrice.toLocaleString()}`,
      };
    } else {
      itemName = item.nama_produk;
      itemId = item.id_produk;
      quantity = item.jumlah;
      basePrice = item.harga_jual;
      subtotal = item.harga_jual * quantity;
      additionalInfo = {
        quantity: quantity,
        price: `Rp ${basePrice.toLocaleString()}`,
      };
    }

    return (
      <tr
        key={`${isCustomCake ? "custom" : isKueReady ? "kue" : "produk"}-${itemId}`}
        className="hover:bg-[#2d2d2d]">
        <td className="px-6 py-4 text-sm text-[#DAA520]">
          <div className="flex items-center space-x-2">
            <span>{itemName}</span>
            {(isKueReady || isCustomCake) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShowDetails(item)}
                className="text-[#FFD700] hover:text-[#DAA520]">
                Lihat Detail
              </Button>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          {isKueReady || isCustomCake ? (
            <span className="text-sm text-[#DAA520]">
              {additionalInfo.quantity}
            </span>
          ) : (
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                handleJumlahProdukChange(itemId, Number(e.target.value));
              }}
              className="w-24 bg-[#3d3d3d] border-[#FFD700] text-[#DAA520]"
            />
          )}
        </td>
        <td className="px-6 py-4 text-sm text-[#DAA520]">
          {additionalInfo.price}
        </td>
        <td className="px-6 py-4 text-sm text-[#DAA520]">
          Rp {subtotal.toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveItem(item)}
            className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border-[#FFD700] border">
            <Trash2 className="w-4 h-4 text-[#FFD700]" />
          </Button>
        </td>
      </tr>
    );
  };

  {/* Dialog untuk menampilkan detail kue ready yang memiliki id_kue */}
  {showCakeDetails && selectedCakeDetails && (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] bg-[#2d2d2d] border-[#FFD700] border">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">
              {selectedItemDetails?.id_custom
                  ? "Detail Kue Pesanan"
                  : "Detail Kue"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bagian kiri - Informasi */}
            <div className="space-y-4 flex-1 text-[#DAA520]">
              {selectedItemDetails?.id_custom ? (
                  // Custom Cake Details dengan tambahan detail biaya
                  <>
                    <p>
                      <strong className="text-[#FFD700]">Jenis Kue:</strong>{" "}
                      {selectedItemDetails.jenis_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Variasi:</strong>{" "}
                      {selectedItemDetails.variasi_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Ukuran:</strong>{" "}
                      {selectedItemDetails.ukuran_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Kotak:</strong>{" "}
                      {selectedItemDetails.kotak_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Jumlah:</strong>{" "}
                      {selectedItemDetails.jumlah_pesanan}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Catatan:</strong>{" "}
                      {selectedItemDetails.catatan_request || "-"}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Harga Dasar:</strong> Rp{" "}
                      {selectedItemDetails.harga_jual.toLocaleString()}
                    </p>

                    {/* Tampilkan daftar biaya tambahan */}
                    {selectedItemDetails.biaya_tambahan &&
                        selectedItemDetails.biaya_tambahan.length > 0 && (
                            <div className="mt-4 bg-[#3d3d3d] p-4 rounded-lg">
                              <p className="font-semibold text-[#FFD700]">
                                Biaya Tambahan:
                              </p>
                              <div className="pl-4">
                                {selectedItemDetails.biaya_tambahan.map(
                                    (item, index) => (
                                        <p key={index} className="text-sm">
                                          {item.nama_item} ({item.jumlah_item}x) - Rp{" "}
                                          {(
                                              item.harga_item * item.jumlah_item
                                          ).toLocaleString()}
                                        </p>
                                    )
                                )}
                              </div>
                              <p className="mt-2">
                                <strong className="text-[#FFD700]">
                                  Total Biaya Tambahan:
                                </strong>{" "}
                                Rp{" "}
                                {selectedItemDetails.total_biaya_tambahan.toLocaleString()}
                              </p>
                            </div>
                        )}

                    <div className="mt-4 pt-4 border-t border-[#FFD700]">
                      <p className="font-semibold">
                        <span className="text-[#FFD700]">Subtotal per Item:</span>{" "}
                        Rp{" "}
                        {(
                            selectedItemDetails.total_harga /
                            selectedItemDetails.jumlah_pesanan
                        ).toLocaleString()}
                      </p>
                      <p className="font-semibold text-lg">
                        <span className="text-[#FFD700]">Total Keseluruhan:</span>{" "}
                        Rp {selectedItemDetails.total_harga.toLocaleString()}
                      </p>
                    </div>
                  </>
              ) : (
                  // Ready Cake Details
                  <>
                    <p>
                      <strong className="text-[#FFD700]">Jenis Kue:</strong>{" "}
                      {selectedItemDetails?.jenis_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Variasi:</strong>{" "}
                      {selectedItemDetails?.variasi_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Ukuran:</strong>{" "}
                      {selectedItemDetails?.ukuran_kue}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Nama di Kue:</strong>{" "}
                      {selectedItemDetails?.cake_name || "-"}
                    </p>
                    <p>
                      <strong className="text-[#FFD700]">Harga:</strong> Rp{" "}
                      {selectedItemDetails?.harga_jual.toLocaleString()}
                    </p>
                  </>
              )}
            </div>

            {/* Bagian kanan - Gambar */}
            <div className="flex-1 flex items-center justify-center">
              {selectedItemDetails?.gambar ? (
                  <div className="w-full flex justify-center">
                    <img
                        src={`http://localhost:3000/${selectedItemDetails.gambar}`}
                        alt="Gambar Kue"
                        className="max-w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border-2 border-[#FFD700]"
                        onClick={() => {
                          // Jika Anda ingin menambahkan fungsi preview gambar yang lebih besar
                          if (typeof setSelectedImage === 'function') {
                            setSelectedImage(`http://localhost:3000/${selectedItemDetails.gambar}`);
                          }
                        }}
                    />
                  </div>
              ) : (
                  <div className="bg-[#3d3d3d] w-full h-64 rounded-lg flex items-center justify-center border border-[#FFD700]">
                    <span className="text-[#DAA520]">Tidak Ada Gambar</span>
                  </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )}

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

  return (
    // TransaksiPOSNurCake
    <Card className="w-full max-w-4xl mx-auto bg-[#2d2d2d] border-[#FFD700] border">
      <CardHeader className="border-b border-[#FFD700]">
        <CardTitle className="text-2xl font-bold text-[#FFD700]">
          Detail Transaksi
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#DAA520] mb-4">
            Informasi Pelanggan
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#DAA520] mb-2 block">
                Transaksi Atas Nama <span className="text-red-500">*</span>
              </label>
              <Input
                id="customer-name-input"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  // Reset error saat user mulai mengetik
                  if (customerNameError) setCustomerNameError(false);
                }}
                placeholder="Masukkan nama pelanggan"
                className={`w-full bg-[#3d3d3d] text-[#DAA520] ${
                  customerNameError
                    ? "border-red-500 border-2"
                    : "border-[#FFD700]"
                }`}
                aria-invalid={customerNameError}
              />
              {customerNameError && (
                <p className="text-red-500 text-sm mt-1">
                  Nama pelanggan harus diisi terlebih dahulu!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detail Produk */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#DAA520] mb-4">
            Detail Produk
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#3d3d3d]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#DAA520]">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#DAA520]">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#DAA520]">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#DAA520]">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#DAA520]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD700]">
                {selectedProduk.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Items Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#DAA520] mb-4">
            Biaya Tambahan
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Nama item"
              value={newItem.nama}
              onChange={(e) => setNewItem({ ...newItem, nama: e.target.value })}
              className="bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
            />
            <Input
              type="number"
              placeholder="Jumlah"
              value={newItem.jumlah}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  jumlah: parseInt(e.target.value) || 1,
                })
              }
              className="bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
            />
            <Input
              type="number"
              placeholder="Harga"
              value={newItem.harga}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  harga: parseFloat(e.target.value) || 0,
                })
              }
              className="bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
            />
          </div>
          <Button
            onClick={handleAddAdditionalItem}
            className="mb-4 bg-[#FFD700] hover:bg-[#DAA520] text-black">
            <Plus className="w-4 h-4 mr-2" /> Tambah Item
          </Button>

          {additionalItems.length > 0 && (
            <table className="w-full mb-4">
              <thead className="bg-[#3d3d3d]">
                <tr>
                  <th className="px-4 py-2 text-left text-[#DAA520]">Nama</th>
                  <th className="px-4 py-2 text-left text-[#DAA520]">Jumlah</th>
                  <th className="px-4 py-2 text-left text-[#DAA520]">Harga</th>
                  <th className="px-4 py-2 text-left text-[#DAA520]">
                    Subtotal
                  </th>
                  <th className="px-4 py-2 text-left text-[#DAA520]">Action</th>
                </tr>
              </thead>
              <tbody className="text-[#DAA520]">
                {additionalItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{item.nama}</td>
                    <td className="px-4 py-2">{item.jumlah}</td>
                    <td className="px-4 py-2">
                      Rp {item.harga.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      Rp {(item.jumlah * item.harga).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAdditionalItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#DAA520] mb-4">Catatan</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan untuk pesanan ini..."
            className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri - Informasi Pembayaran */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#DAA520] mb-3">
                Informasi Pembayaran
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#DAA520] mb-2">
                    Total Harga
                  </p>
                  <div className="text-2xl font-bold text-[#FFD700]">
                    Rp {totalHarga.toLocaleString()}
                  </div>
                </div>

                {/* Pilihan Metode Pembayaran */}
                <div className="flex space-x-4">
                  <Button
                    className={`flex-1 ${
                      metodePembayaran === "cash"
                        ? "bg-[#FFD700] text-black"
                        : "bg-[#3d3d3d] text-[#DAA520]"
                    }`}
                    onClick={() => setMetodePembayaran("cash")}>
                    Cash
                  </Button>
                  <Button
                    className={`flex-1 ${
                      metodePembayaran === "transfer"
                        ? "bg-[#FFD700] text-black"
                        : "bg-[#3d3d3d] text-[#DAA520]"
                    }`}
                    onClick={() => setMetodePembayaran("transfer")}>
                    Transfer
                  </Button>
                </div>

                {/* Input Pembayaran */}
                <div>
                  <p className="text-sm font-medium text-[#DAA520] mb-2">
                    {metodePembayaran === "cash"
                      ? "Jumlah Dibayar"
                      : "Jumlah Transfer"}
                  </p>
                  <Input
                    type="number"
                    value={jumlahDibayar}
                    onChange={(e) => setJumlahDibayar(Number(e.target.value))}
                    className="w-full mb-2 bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                  />
                </div>

                {/* Status Pembayaran */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#DAA520]">
                    Status Pembayaran: {statusPembayaran}
                  </p>
                  {kembalian > 0 && (
                    <p className="text-[#FFD700] font-medium">
                      Kembalian: Rp {kembalian.toLocaleString()}
                    </p>
                  )}
                  {sisaHutang > 0 && (
                    <p className="text-red-500 font-medium">
                      {metodePembayaran === "transfer"
                        ? "Sisa Pembayaran"
                        : "Kurang"}
                      : Rp {sisaHutang.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Tanggal */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#DAA520] mb-3">
                Informasi Waktu
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#DAA520] mb-2">
                    Tanggal Transaksi
                  </p>
                  <Input
                    type="date"
                    value={tanggalTransaksi}
                    onChange={(e) =>
                      handleTanggalTransaksiChange(e.target.value)
                    }
                    className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#DAA520] mb-2">
                    Tanggal Pengambilan
                  </p>
                  <Input
                    type="date"
                    value={tanggalPengambilan}
                    onChange={(e) =>
                      handleTanggalPengambilanChange(e.target.value)
                    }
                    className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#DAA520] mb-2">
                    Jam Pengambilan
                  </p>
                  <Input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={handleSimpanPesanan}
            className="px-8 py-3 bg-[#FFD700] hover:bg-[#DAA520] text-black">
            <Save className="w-4 h-4 mr-2" />
            Simpan Pesanan
          </Button>
        </div>
      </CardContent>

      {/* Dialog untuk detail produk */}
      {/* Dialog untuk detail produk */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700] sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">
              {selectedItemDetails?.id_custom
                  ? "Detail Kue Pesanan"
                  : "Detail Kue"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bagian kiri - Informasi */}
            <div className="space-y-4 flex-1">
              {selectedItemDetails?.id_custom ? (
                  // Custom Cake Details
                  <>
                    <p className="text-[#FFD700]">
                      <strong>Jenis Kue:</strong> {selectedItemDetails.jenis_kue}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Variasi:</strong> {selectedItemDetails.variasi_kue}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Ukuran:</strong> {selectedItemDetails.ukuran_kue}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Kotak:</strong> {selectedItemDetails.kotak_kue}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Jumlah:</strong> {selectedItemDetails.jumlah_pesanan}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Catatan:</strong>{" "}
                      {selectedItemDetails.catatan_request || "-"}
                    </p>
                    <p className="text-[#FFD700]">
                      <strong>Harga Dasar per Item:</strong> Rp{" "}
                      {selectedItemDetails.harga_jual.toLocaleString()}
                    </p>

                    {selectedItemDetails.biaya_tambahan &&
                        selectedItemDetails.biaya_tambahan.length > 0 && (
                            <div className="mt-4 bg-[#3d3d3d] p-4 rounded-lg">
                              <p className="font-semibold mb-2">Biaya Tambahan:</p>
                              <div className="space-y-2">
                                {selectedItemDetails.biaya_tambahan.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center text-sm">
                                          <span>{item.nama_item}</span>
                                          <div className="text-right">
                                            <div>{item.jumlah_item}x</div>
                                            <div>
                                              Rp {Number(item.harga_item).toLocaleString()}
                                              /item
                                            </div>
                                            <div className="font-medium">
                                              Total: Rp{" "}
                                              {(
                                                  Number(item.harga_item) *
                                                  Number(item.jumlah_item)
                                              ).toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                    )
                                )}
                              </div>
                            </div>
                        )}

                    <div className="mt-4 pt-4 border-t border-[#FFD700] space-y-2">
                      <p className="font-semibold text-[#FFD700]">
                        Subtotal per Item: Rp{" "}
                        {(
                            selectedItemDetails.total_harga /
                            selectedItemDetails.jumlah_pesanan
                        ).toLocaleString()}
                      </p>
                      <p className="font-semibold text-lg text-[#FFD700]">
                        Total Keseluruhan: Rp{" "}
                        {selectedItemDetails.total_harga.toLocaleString()}
                      </p>
                    </div>
                  </>
              ) : (
                  // Ready Cake Details
                  <>
                    <p>
                      <strong>Jenis Kue:</strong> {selectedItemDetails?.jenis_kue}
                    </p>
                    <p>
                      <strong>Variasi:</strong> {selectedItemDetails?.variasi_kue}
                    </p>
                    <p>
                      <strong>Ukuran:</strong> {selectedItemDetails?.ukuran_kue}
                    </p>
                    <p>
                      <strong>Nama di Kue:</strong>{" "}
                      {selectedItemDetails?.cake_name || "-"}
                    </p>
                    <p>
                      <strong>Harga:</strong> Rp{" "}
                      {selectedItemDetails?.harga_jual.toLocaleString()}
                    </p>
                  </>
              )}
            </div>

            {/* Bagian kanan - Gambar */}
            <div className="flex-1 flex items-center justify-center">
              {selectedItemDetails?.gambar ? (
                  <div className="w-full flex justify-center">
                    <img
                        src={`http://localhost:3000/${selectedItemDetails.gambar}`}
                        alt="Gambar Kue"
                        className="max-w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border-2 border-[#FFD700]"
                        onClick={() => {
                          // Jika Anda ingin menambahkan fungsi preview gambar yang lebih besar
                          if (typeof setSelectedImage === 'function') {
                            setSelectedImage(`http://localhost:3000/${selectedItemDetails.gambar}`);
                          }
                        }}
                    />
                  </div>
              ) : (
                  <div className="bg-[#3d3d3d] w-full h-64 rounded-lg flex items-center justify-center border border-[#FFD700]">
                    <span className="text-[#DAA520]">Tidak Ada Gambar</span>
                  </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog untuk konfirmasi pembayaran kurang */}
      <Dialog
        open={showConfirmPaymentDialog}
        onOpenChange={setShowConfirmPaymentDialog}>
        <DialogContent className="bg-[#2d2d2d] border-[#FFD700] border">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">
              Pembayaran Kurang
            </DialogTitle>
          </DialogHeader>
          <div className="text-center my-6">
            <div className="text-[#DAA520] mb-2">
              Pembayaran kurang sebesar:
            </div>
            <div className="text-[#FFD700] text-3xl font-bold my-4">
              Rp {sisaHutang.toLocaleString()}
            </div>
            <div className="text-[#DAA520] mt-2">
              Pesanan akan dianggap DP dan harus dilunasi pada saat pengambilan.
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              onClick={() => setShowConfirmPaymentDialog(false)}
              className="bg-[#3d3d3d] text-[#DAA520] border-[#FFD700] hover:bg-[#DAA520] hover:text-[#3d3d3d] transition-colors">
              Batal
            </Button>
            <Button
              onClick={() => {
                setShowConfirmPaymentDialog(false);
                simpanPesanan();
              }}
              className="bg-[#FFD700] text-black hover:bg-[#F0C000] hover:border-[#F0C000] transition-colors">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TransaksiPOSNurCake;
