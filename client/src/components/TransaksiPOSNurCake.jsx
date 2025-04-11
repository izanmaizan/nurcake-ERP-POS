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
import { Trash2, Save, Plus, Printer, X } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import { jsPDF } from "jspdf";
// import escpos from 'escpos';

// Konstanta API
const API = import.meta.env.VITE_API || "http://localhost:3000";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Tambahkan state baru untuk Dialog konfirmasi
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] =
    useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" // bisa 'success', 'error', 'warning'
  });

  const simpanPesanan = async () => {
    try {
      // Siapkan FormData untuk menangani upload file
      const formData = new FormData();

      // Format tanggal untuk MySQL
      const formatTanggalMySQL = (tanggalObj) => {
        if (!tanggalObj) return null;
        // Konversi ke format YYYY-MM-DD yang diterima MySQL
        const date = new Date(tanggalObj);
        return date.toISOString().split('T')[0];
      };

      // Proses item pesanan dan tambahkan gambar jika ada
      const formattedItems = selectedProduk.map((item) => {
        // Untuk kue request/custom cake
        if (item.tipe === "custom_cake") {
          // Klon item tanpa referensi gambar asli
          const itemData = {
            id_custom: item.id_custom,
            jenis_kue: item.jenis_kue,
            variasi_kue: item.variasi_kue,
            ukuran_kue: item.ukuran_kue,
            kotak_kue: item.kotak_kue,
            modal: item.modal,
            harga_jual: item.harga_jual,
            total_modal: item.total_modal,
            total_harga: item.total_harga,
            jumlah_pesanan: item.jumlah_pesanan,
            biaya_tambahan: item.biaya_tambahan,
            total_biaya_tambahan: item.total_biaya_tambahan,
            tipe: "custom_cake",
            gambar_model: [], // Array untuk menyimpan path gambar
          };

          // Jika item memiliki gambar_model, proses untuk upload
          if (item.gambar_model && item.gambar_model.length > 0) {
            // Simpan referensi ke gambar_model untuk diproses nanti
            itemData.gambar_model_refs = item.gambar_model.map((img, index) => {
              // Buat identifier unik untuk setiap gambar
              const imgKey = `cake_img_${item.id_custom}_${index}`;

              // Jika gambar adalah File atau Blob, tambahkan ke FormData
              if (img instanceof File || img instanceof Blob) {
                formData.append(imgKey, img);
              }
              // Jika gambar sudah berupa string URL, gunakan langsung
              else if (typeof img === 'string') {
                // Jika URL sudah berupa path di server, gunakan saja
                if (img.startsWith('uploads/')) {
                  itemData.gambar_model.push(img);
                }
                // Jika URL adalah data URL, konversi ke file
                else if (img.startsWith('data:')) {
                  // Kode untuk konversi data URL ke File
                  const byteString = atob(img.split(',')[1]);
                  const mimeString = img.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }
                  const blob = new Blob([ab], { type: mimeString });
                  const file = new File([blob], `cake_image_${Date.now()}.jpg`, { type: mimeString });
                  formData.append(imgKey, file);
                }
              }

              return imgKey;
            });
          }

          return itemData;
        }

        // Untuk kue ready dan produk reguler (tidak berubah)
        if (item.id_kue) {
          const total_modal = item.modal_pembuatan;
          const total_harga = item.harga_jual;

          return {
            id_kue: item.id_kue,
            jenis_kue: item.jenis_kue,
            modal_pembuatan: item.modal_pembuatan,
            harga_jual: item.harga_jual,
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
          modal_produk: item.modal_produk,
          harga_jual: item.harga_jual,
          jumlah: item.jumlah,
          total_modal: total_modal,
          total_harga: total_harga,
          tipe: "produk_reguler",
        };
      });

      // Data transaksi untuk dikirim ke backend
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

      // Tambahkan data transaksi ke FormData
      formData.append('data', JSON.stringify(transaksiData));

      // Buat request ke endpoint yang mendukung multipart/form-data
      const response = await axios.post(
          `${API}/transaksi-nc`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
      );

      // Proses setelah transaksi berhasil tersimpan
      if (response.data.imagePaths) {
        // Update formattedItems dengan path gambar dari server
        response.data.imagePaths.forEach((path, index) => {
          const [itemIndex, imgIndex] = path.itemImageIds.split('_');
          if (formattedItems[itemIndex] && formattedItems[itemIndex].tipe === "custom_cake") {
            if (!formattedItems[itemIndex].gambar_model) {
              formattedItems[itemIndex].gambar_model = [];
            }
            formattedItems[itemIndex].gambar_model[imgIndex] = path.serverPath;
          }
        });
      }

      // Perbarui tampilan daftar kue ready setelah menghapus
      if (triggerKueReadyRefresh) {
        triggerKueReadyRefresh();
      }

      // Cetak struk otomatis setelah transaksi berhasil
      cetakLaporan({
        ...transaksiData,
        id_transaksi: response.data.id_transaksi,
      });

      // Ganti alert dengan notifikasi toast
      showNotification("Transaksi berhasil disimpan dan struk sedang dicetak!", "success");
      handleJualProduk();
    } catch (error) {
      console.error("Error saat menyimpan pesanan:", error);
      // Tampilkan pesan error dengan toast juga
      showNotification("Gagal menyimpan pesanan: " + (error.response?.data?.message || error.message), "error");
    }
  };

  const handleShowDetails = (item) => {
    setSelectedItemDetails(item);
    setShowDetails(true);
  };
  // Helper function untuk format tanggal

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
      setStatusPembayaran("Kembalian");
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

  // Helper function untuk tampilkan notifikasi
  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type
    });

    // Menghilangkan notifikasi setelah 3 detik
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
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
            className="hover:bg-[#FAF3E0]">
          <td className="px-6 py-4 text-sm text-[#8B7D3F]">
            <div className="flex items-center space-x-2">
              <span>{itemName}</span>
              {(isKueReady || isCustomCake) && (
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowDetails(item)}
                      className="text-[#D4AF37] hover:text-[#8B7D3F]">
                    Lihat Detail
                  </Button>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            {isKueReady || isCustomCake ? (
                <span className="text-sm text-[#8B7D3F]">
            {additionalInfo.quantity}
          </span>
            ) : (
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      handleJumlahProdukChange(itemId, Number(e.target.value));
                    }}
                    className="w-24 bg-[#FAF3E0] border-[#B8A361] text-[#8B7D3F]"
                />
            )}
          </td>
          <td className="px-6 py-4 text-sm text-[#8B7D3F]">
            {additionalInfo.price}
          </td>
          <td className="px-6 py-4 text-sm text-[#8B7D3F]">
            Rp {subtotal.toLocaleString()}
          </td>
          <td className="px-6 py-4">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveItem(item)}
                className="bg-[#FAF3E0] hover:bg-[#E6BE8A] border-[#B8A361] border">
              <Trash2 className="w-4 h-4 text-[#8B7D3F]" />
            </Button>
          </td>
        </tr>
    );
  };

  // Tambahkan komponen Toast di akhir JSX return
// Letakkan sebelum tag penutup terakhir dari komponen utama
  const ToastNotification = () => {
    if (!notification.show) return null;

    return (
        <div className={`fixed top-16 right-4 z-50 transition-all duration-1000 ${notification.show ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`rounded-md px-4 py-3 shadow-md max-w-xs ${
              notification.type === 'success'
                  ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
                  : notification.type === 'error'
                      ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
                      : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
              )}
              {notification.type === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
              )}
              {notification.type === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
              )}
              <p>{notification.message}</p>
            </div>
          </div>
        </div>
    );
  };

  const cetakLaporan = (pesanan) => {
    // Hitung tinggi yang dibutuhkan
    const calculateHeight = () => {
      let totalHeight = 0;

      // Header (logo, alamat, telp)
      totalHeight += 40; // Ditambah untuk ruang logo

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

      // Ringkasan pembayaran (subtotal, total, tunai, kembalian/kurang)
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

    // Tambahkan logo (gunakan placeholder atau path ke logo Anda)
    try {
      // Logo path - ganti dengan path logo Anda
      const logoPath = 'assets/logo-nur-cake.png'; // Sesuaikan dengan lokasi logo
      doc.addImage(logoPath, 'PNG', 5, 5, 15, 15);
    } catch (error) {
      console.error("Error menambahkan logo:", error);
      // Lanjutkan tanpa logo jika terjadi error
    }

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
    // Ubah tampilan KEMBALI menjadi KEMBALIAN/KURANG
    const selisih = pesanan.jumlah_dibayar - pesanan.total_harga;
    if (selisih >= 0) {
      doc.text("KEMBALIAN", 5, yPos);
      rightText(formatCurrency(selisih), yPos);
    } else {
      doc.text("KURANG", 5, yPos);
      rightText(formatCurrency(Math.abs(selisih)), yPos);
    }

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

    // Tambahan untuk pencetakan ESC/POS
    // cetakToESCPOS(pesanan);
  };

  // Fungsi untuk mencetak ke printer thermal menggunakan ESC/POS
  // const cetakToESCPOS = (pesanan) => {
  //   try {
  //     // Menggunakan library escpos-web untuk koneksi printer
  //     // Pastikan library sudah diinstal: npm install escpos escpos-web
  //     // Import library di bagian atas file
  //     // import { WebUSB } from 'escpos-web';
  //     // import escpos from 'escpos';
  //
  //     // Konfigurasi dan pencetakan ESC/POS
  //     const formatEscPos = async () => {
  //       try {
  //         // Cari printer USB
  //         const device = await navigator.usb.requestDevice({
  //           filters: [{ vendorId: 0x0000 }] // Ganti dengan vendor ID printer Anda
  //         });
  //
  //         // Siapkan printer
  //         const adapter = new WebUSB(device);
  //         const printer = new escpos.Printer(adapter);
  //
  //         await adapter.open();
  //
  //         // Mulai pencetakan
  //         printer
  //             .font('a')
  //             .align('ct')
  //             .style('b')
  //             .size(1, 1)
  //             .text('NUR CAKE')
  //             .size(0, 0)
  //             .style('normal')
  //             .text('Jln. Koto Panai, Air Haji')
  //             .text('Telp: +6282383353040')
  //             .drawLine()
  //             .align('lt')
  //             .text(`No. Struk : ${pesanan.id_transaksi}`)
  //             .text(`Kasir    : Admin`)
  //             .text(`Tanggal  : ${formatDate(pesanan.tanggal_transaksi)}`)
  //             .text(`Jam      : ${new Date().toLocaleTimeString("id-ID")}`)
  //             .drawLine();
  //
  //         // Header item
  //         printer
  //             .tableCustom([
  //               { text: 'Item', align: 'LEFT', width: 0.5 },
  //               { text: 'Qty', align: 'RIGHT', width: 0.2 },
  //               { text: 'Total', align: 'RIGHT', width: 0.3 }
  //             ]);
  //
  //         // Cetak items
  //         pesanan.items.forEach((item) => {
  //           const itemName = item.jenis_kue || item.nama_produk;
  //           const qty = item.jumlah || item.jumlah_pesanan;
  //           const total = item.total_harga || (item.harga_jual * qty);
  //
  //           printer.text(itemName);
  //           printer.tableCustom([
  //             { text: formatCurrency(item.harga_jual), align: 'LEFT', width: 0.5 },
  //             { text: `${qty}x`, align: 'RIGHT', width: 0.2 },
  //             { text: formatCurrency(total), align: 'RIGHT', width: 0.3 }
  //           ]);
  //
  //           // Cetak biaya tambahan jika ada
  //           if (item.biaya_tambahan && item.biaya_tambahan.length > 0) {
  //             printer.text('Biaya Tambahan:');
  //
  //             item.biaya_tambahan.forEach((biaya) => {
  //               const biayaText = `${biaya.nama_item} (${biaya.jumlah_item}x)`;
  //               const biayaTotal = biaya.jumlah_item * biaya.harga_item;
  //
  //               printer.tableCustom([
  //                 { text: biayaText, align: 'LEFT', width: 0.7 },
  //                 { text: formatCurrency(biayaTotal), align: 'RIGHT', width: 0.3 }
  //               ]);
  //             });
  //
  //             printer.text(`Total Biaya Tambahan: ${formatCurrency(item.total_biaya_tambahan || 0)}`);
  //           }
  //         });
  //
  //         // Cetak additional items jika ada
  //         if (pesanan.additional_items && pesanan.additional_items.length > 0) {
  //           printer.text('Biaya Tambahan Lainnya:');
  //
  //           pesanan.additional_items.forEach((item) => {
  //             const itemText = `${item.nama} (${item.jumlah}x)`;
  //             const itemTotal = item.jumlah * item.harga;
  //
  //             printer.tableCustom([
  //               { text: itemText, align: 'LEFT', width: 0.7 },
  //               { text: formatCurrency(itemTotal), align: 'RIGHT', width: 0.3 }
  //             ]);
  //           });
  //
  //           const additionalTotal = pesanan.additional_items.reduce(
  //               (sum, item) => sum + item.jumlah * item.harga, 0
  //           );
  //
  //           printer.text(`Total Biaya Tambahan Lainnya: ${formatCurrency(additionalTotal)}`);
  //         }
  //
  //         // Total, Tunai, dan Kembalian/Kurang
  //         printer.drawLine();
  //
  //         printer.tableCustom([
  //           { text: 'TOTAL', align: 'LEFT', width: 0.5 },
  //           { text: formatCurrency(pesanan.total_harga), align: 'RIGHT', width: 0.5 }
  //         ]);
  //
  //         printer.tableCustom([
  //           { text: 'TUNAI', align: 'LEFT', width: 0.5 },
  //           { text: formatCurrency(pesanan.jumlah_dibayar), align: 'RIGHT', width: 0.5 }
  //         ]);
  //
  //         const selisih = pesanan.jumlah_dibayar - pesanan.total_harga;
  //         if (selisih >= 0) {
  //           printer.tableCustom([
  //             { text: 'KEMBALIAN', align: 'LEFT', width: 0.5 },
  //             { text: formatCurrency(selisih), align: 'RIGHT', width: 0.5 }
  //           ]);
  //         } else {
  //           printer.tableCustom([
  //             { text: 'KURANG', align: 'LEFT', width: 0.5 },
  //             { text: formatCurrency(Math.abs(selisih)), align: 'RIGHT', width: 0.5 }
  //           ]);
  //         }
  //
  //         printer.drawLine();
  //
  //         // Informasi pengambilan
  //         printer.tableCustom([
  //           { text: 'Tanggal Ambil:', align: 'LEFT', width: 0.5 },
  //           { text: formatDate(pesanan.tanggal_pengambilan), align: 'RIGHT', width: 0.5 }
  //         ]);
  //
  //         printer.tableCustom([
  //           { text: 'Jam Ambil:', align: 'LEFT', width: 0.5 },
  //           { text: pesanan.waktu_pengambilan, align: 'RIGHT', width: 0.5 }
  //         ]);
  //
  //         // Footer
  //         printer
  //             .drawLine()
  //             .align('ct')
  //             .text('-- Terima Kasih --')
  //             .text('Barang yang sudah dibeli tidak dapat dikembalikan')
  //             .cut()
  //             .close();
  //
  //         showNotification("Struk berhasil dicetak ke printer thermal!", "success");
  //       } catch (error) {
  //         console.error("Error saat mencetak ke printer ESC/POS:", error);
  //         showNotification("Gagal mencetak ke printer thermal. Cek koneksi printer!", "error");
  //       }
  //     };
  //
  //     // Panggil fungsi cetak ESC/POS
  //     formatEscPos();
  //
  //   } catch (error) {
  //     console.error("Error saat mencoba mencetak via ESC/POS:", error);
  //     showNotification("Printer thermal tidak terdeteksi atau tidak didukung", "warning");
  //   }
  // };


  return (
      // TransaksiPOSNurCake
      <div>
      <Card className="w-full mx-auto bg-[#FFF8E7] border-[#B8A361] border shadow-md">
        <CardHeader className="border-b border-[#B8A361] px-4 py-3 md:px-6 md:py-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-[#8B7D3F]">
            Detail Transaksi
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 md:p-6">
          {/* Customer Information */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-lg font-semibold text-[#8B7D3F] mb-2 md:mb-4">
              Informasi Pelanggan
            </h3>
            <div>
              <label className="text-sm font-medium text-[#8B7D3F] mb-1 block">
                Transaksi Atas Nama <span className="text-red-500">*</span>
              </label>
              <Input
                  id="customer-name-input"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (customerNameError) setCustomerNameError(false);
                  }}
                  placeholder="Masukkan nama pelanggan"
                  className={`w-full bg-[#FAF3E0] text-[#8B7D3F] ${
                      customerNameError
                          ? "border-red-500 border-2"
                          : "border-[#B8A361]"
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


          {/* Detail Produk - Card style untuk mobile */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#8B7D3F] mb-2 md:mb-4">
              Detail Produk
            </h3>

            {/* Table for desktop, Cards for mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#E6BE8A]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8B7D3F]">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8B7D3F]">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8B7D3F]">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8B7D3F]">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#8B7D3F]">
                    Action
                  </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#C5B358]">
                {selectedProduk.map(renderTableRow)}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {selectedProduk.map((item) => {
                const isKueReady = Boolean(item.id_kue);
                const isCustomCake = Boolean(item.id_custom);
                let itemName, itemId, quantity, subtotal, basePrice, additionalInfo;

                // Reusing the same logic from renderTableRow for consistency
                if (isCustomCake) {
                  itemName = `Custom Cake - ${item.jenis_kue}`;
                  itemId = item.id_custom;
                  quantity = item.jumlah_pesanan;
                  basePrice = item.harga_jual;
                  subtotal = item.total_harga;

                  const totalAdditionalItems = item.biaya_tambahan.reduce(
                      (sum, tambahan) => sum + Number(tambahan.jumlah_item),
                      0
                  );

                  additionalInfo = {
                    quantity: totalAdditionalItems > 0
                        ? `${quantity} (+${totalAdditionalItems} Biaya Tambahan)`
                        : quantity,
                    price: item.total_biaya_tambahan > 0
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
                    <div key={`${isCustomCake ? "custom" : isKueReady ? "kue" : "produk"}-${itemId}`}
                         className="bg-[#FAF3E0] rounded-lg border border-[#B8A361] p-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-[#8B7D3F]">{itemName}</div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item)}
                            className="bg-[#FAF3E0] hover:bg-[#E6BE8A] border-[#B8A361] border h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-[#8B7D3F]" />
                        </Button>
                      </div>

                      {(isKueReady || isCustomCake) && (
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowDetails(item)}
                              className="text-[#D4AF37] hover:text-[#8B7D3F] p-0 h-6 mt-1">
                            Lihat Detail
                          </Button>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <div className="text-xs text-[#8B7D3F]">Jumlah</div>
                          {isKueReady || isCustomCake ? (
                              <div className="font-medium text-[#8B7D3F]">
                                {additionalInfo.quantity}
                              </div>
                          ) : (
                              <Input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => {
                                    handleJumlahProdukChange(itemId, Number(e.target.value));
                                  }}
                                  className="w-full h-8 bg-[#FAF3E0] border-[#B8A361] text-[#8B7D3F]"
                              />
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-[#8B7D3F]">Harga</div>
                          <div className="font-medium text-[#8B7D3F]">
                            {additionalInfo.price}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#B8A361] flex justify-between">
                        <div className="text-xs text-[#8B7D3F]">Subtotal</div>
                        <div className="text-sm font-bold text-[#D4AF37]">
                          Rp {subtotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Additional Items Section - Modified for mobile */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#8B7D3F] mb-2 md:mb-4">
              Biaya Tambahan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Input
                  placeholder="Nama item"
                  value={newItem.nama}
                  onChange={(e) => setNewItem({ ...newItem, nama: e.target.value })}
                  className="bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
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
                  className="bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
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
                  className="bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
              />
            </div>
            <Button
                onClick={handleAddAdditionalItem}
                className="mb-4 bg-[#D4AF37] hover:bg-[#C5B358] text-white">
              <Plus className="w-4 h-4 mr-2" /> Tambah Item
            </Button>

            {additionalItems.length > 0 && (
                <div>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full mb-4">
                      <thead className="bg-[#E6BE8A]">
                      <tr>
                        <th className="px-4 py-2 text-left text-[#8B7D3F]">Nama</th>
                        <th className="px-4 py-2 text-left text-[#8B7D3F]">Jumlah</th>
                        <th className="px-4 py-2 text-left text-[#8B7D3F]">Harga</th>
                        <th className="px-4 py-2 text-left text-[#8B7D3F]">Subtotal</th>
                        <th className="px-4 py-2 text-left text-[#8B7D3F]">Action</th>
                      </tr>
                      </thead>
                      <tbody className="text-[#8B7D3F]">
                      {additionalItems.map((item, index) => (
                          <tr key={index} className="hover:bg-[#FAF3E0]">
                            <td className="px-4 py-2">{item.nama}</td>
                            <td className="px-4 py-2">{item.jumlah}</td>
                            <td className="px-4 py-2">Rp {item.harga.toLocaleString()}</td>
                            <td className="px-4 py-2">Rp {(item.jumlah * item.harga).toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveAdditionalItem(index)}
                                  className="bg-[#FAF3E0] hover:bg-[#E6BE8A] border-[#B8A361] border">
                                <Trash2 className="w-4 h-4 text-[#8B7D3F]" />
                              </Button>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {additionalItems.map((item, index) => (
                        <div key={index} className="bg-[#FAF3E0] rounded-lg border border-[#B8A361] p-3">
                          <div className="flex justify-between">
                            <div className="font-medium text-[#8B7D3F]">{item.nama}</div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveAdditionalItem(index)}
                                className="bg-[#FAF3E0] hover:bg-[#E6BE8A] border-[#B8A361] border h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4 text-[#8B7D3F]" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <div className="text-xs text-[#8B7D3F]">Jumlah</div>
                              <div className="font-medium text-[#8B7D3F]">{item.jumlah}</div>
                            </div>
                            <div>
                              <div className="text-xs text-[#8B7D3F]">Harga</div>
                              <div className="font-medium text-[#8B7D3F]">Rp {item.harga.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#B8A361] flex justify-between">
                            <div className="text-xs text-[#8B7D3F]">Subtotal</div>
                            <div className="text-sm font-bold text-[#D4AF37]">
                              Rp {(item.jumlah * item.harga).toLocaleString()}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Notes Section - Simplified */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#8B7D3F] mb-2">Catatan</h3>
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan untuk pesanan ini..."
                className="w-full bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
            />
          </div>

          {/* Payment and Time - Cards for Mobile */}
          <div className="space-y-6">
            {/* Pembayaran Card */}
            <div className="bg-[#FAF3E0] rounded-lg border border-[#B8A361] p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-[#8B7D3F] mb-3">
                Informasi Pembayaran
              </h3>

              <div className="mb-4">
                <p className="text-sm font-medium text-[#8B7D3F] mb-1">
                  Total Harga
                </p>
                <div className="text-2xl font-bold text-[#D4AF37]">
                  Rp {totalHarga.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-[#8B7D3F] mb-2">
                  Metode Pembayaran
                </p>
                <div className="flex space-x-2">
                  <Button
                      className={`flex-1 ${
                          metodePembayaran === "cash"
                              ? "bg-[#D4AF37] text-white"
                              : "bg-[#FAF3E0] text-[#D4AF33] border-[#B8A361] border"
                      }`}
                      onClick={() => setMetodePembayaran("cash")}>
                    Cash
                  </Button>
                  <Button
                      className={`flex-1 ${
                          metodePembayaran === "transfer"
                              ? "bg-[#D4AF37] text-white"
                              : "bg-[#FAF3E0] text-[#D4AF33] border-[#B8A361] border"
                      }`}
                      onClick={() => setMetodePembayaran("transfer")}>
                    Transfer
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-[#8B7D3F] mb-2">
                  {metodePembayaran === "cash" ? "Jumlah Dibayar" : "Jumlah Transfer"}
                </p>
                <Input
                    type="number"
                    value={jumlahDibayar}
                    onChange={(e) => setJumlahDibayar(Number(e.target.value))}
                    className="w-full mb-2 bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
                />
              </div>

              <div className="p-3 bg-white rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-[#8B7D3F]">
                    Status Pembayaran:
                  </p>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      statusPembayaran === "Lunas"
                          ? "bg-green-100 text-green-700"
                          : statusPembayaran === "DP"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                  }`}>
              {statusPembayaran}
            </span>
                </div>

                {kembalian > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-[#8B7D3F]">Kembalian:</p>
                      <p className="text-[#D4AF37] font-medium">
                        Rp {kembalian.toLocaleString()}
                      </p>
                    </div>
                )}

                {sisaHutang > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-[#8B7D3F]">
                        {metodePembayaran === "transfer" ? "Sisa Pembayaran:" : "Kurang:"}
                      </p>
                      <p className="text-red-500 font-medium">
                        Rp {sisaHutang.toLocaleString()}
                      </p>
                    </div>
                )}
              </div>
            </div>

            {/* Tanggal Card */}
            <div className="bg-[#FAF3E0] rounded-lg border border-[#B8A361] p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-[#8B7D3F] mb-3">
                Informasi Waktu
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#8B7D3F] mb-1">
                    Tanggal Transaksi
                  </p>
                  <Input
                      type="date"
                      value={tanggalTransaksi}
                      onChange={(e) => handleTanggalTransaksiChange(e.target.value)}
                      className="w-full bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8B7D3F] mb-1">
                    Tanggal Pengambilan
                  </p>
                  <Input
                      type="date"
                      value={tanggalPengambilan}
                      onChange={(e) => handleTanggalPengambilanChange(e.target.value)}
                      className="w-full bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8B7D3F] mb-1">
                    Jam Pengambilan
                  </p>
                  <Input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-[#FAF3E0] text-[#8B7D3F] border-[#B8A361]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button - Made sticky for mobile */}
          <div className="sticky bottom-0 left-0 right-0 bg-[#FFF8E7] p-4 mt-6 border-t border-[#B8A361] flex justify-center">
            <Button
                onClick={handleSimpanPesanan}
                className="w-full sm:w-auto px-8 py-3 bg-[#D4AF37] hover:bg-[#C5B358] text-white shadow-md">
              <Save className="w-4 h-4 mr-2" />
              Simpan Pesanan
            </Button>
          </div>
        </CardContent>

        {/* Dialog untuk detail produk */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="bg-[#FFF8E7] text-[#8B7D3F] border-[#B8A361] sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37]">
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
                      <p className="text-[#8B7D3F]">
                        <strong>Jenis Kue:</strong> {selectedItemDetails.jenis_kue}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Variasi:</strong> {selectedItemDetails.variasi_kue}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Ukuran:</strong> {selectedItemDetails.ukuran_kue}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Kotak:</strong> {selectedItemDetails.kotak_kue}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Jumlah:</strong> {selectedItemDetails.jumlah_pesanan}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Catatan:</strong>{" "}
                        {selectedItemDetails.catatan_request || "-"}
                      </p>
                      <p className="text-[#8B7D3F]">
                        <strong>Harga Dasar per Item:</strong> Rp{" "}
                        {selectedItemDetails.harga_jual.toLocaleString()}
                      </p>

                      {selectedItemDetails.biaya_tambahan &&
                          selectedItemDetails.biaya_tambahan.length > 0 && (
                              <div className="mt-4 bg-[#FAF3E0] p-4 rounded-lg">
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

                      <div className="mt-4 pt-4 border-t border-[#B8A361] space-y-2">
                        <p className="font-semibold text-[#8B7D3F]">
                          Subtotal per Item: Rp{" "}
                          {(
                              selectedItemDetails.total_harga /
                              selectedItemDetails.jumlah_pesanan
                          ).toLocaleString()}
                        </p>
                        <p className="font-semibold text-lg text-[#D4AF37]">
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
              <div className="flex-1">
                {selectedItemDetails ? (
                    <div className="w-full flex flex-col gap-4">
                      {/* Untuk custom cake dengan multiple gambar */}
                      {selectedItemDetails.id_custom && selectedItemDetails.gambar_model && Array.isArray(selectedItemDetails.gambar_model) && selectedItemDetails.gambar_model.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedItemDetails.gambar_model.map((gambar, index) => (
                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border-2 border-[#B8A361]">
                                  <img
                                      src={typeof gambar === 'string' && gambar.startsWith('uploads/')
                                          ? `${API}/${gambar}`
                                          : gambar}
                                      alt={`Gambar Model ${index + 1}`}
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => {
                                        if (typeof setSelectedImage === 'function') {
                                          const imageSrc = typeof gambar === 'string' && gambar.startsWith('uploads/')
                                              ? `${API}/${gambar}`
                                              : gambar;
                                          setSelectedImage(imageSrc);
                                        }
                                      }}
                                  />
                                </div>
                            ))}
                          </div>
                      ) : selectedItemDetails.id_custom && selectedItemDetails.gambar_model ? (
                          // Untuk custom cake dengan satu gambar
                          <div className="aspect-video rounded-lg overflow-hidden border-2 border-[#B8A361]">
                            <img
                                src={typeof selectedItemDetails.gambar_model === 'string' && selectedItemDetails.gambar_model.startsWith('uploads/')
                                    ? `${API}/${selectedItemDetails.gambar_model}`
                                    : selectedItemDetails.gambar_model}
                                alt="Gambar Kue"
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  if (typeof setSelectedImage === 'function') {
                                    const imageSrc = typeof selectedItemDetails.gambar_model === 'string' && selectedItemDetails.gambar_model.startsWith('uploads/')
                                        ? `${API}/${selectedItemDetails.gambar_model}`
                                        : selectedItemDetails.gambar_model;
                                    setSelectedImage(imageSrc);
                                  }
                                }}
                            />
                          </div>
                      ) : selectedItemDetails.gambar ? (
                          // Untuk kue ready dengan gambar
                          <div className="aspect-video rounded-lg overflow-hidden border-2 border-[#B8A361]">
                            <img
                                src={`${API}/${selectedItemDetails.gambar}`}
                                alt="Gambar Kue"
                                className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  if (typeof setSelectedImage === 'function') {
                                    setSelectedImage(`${API}/${selectedItemDetails.gambar}`);
                                  }
                                }}
                            />
                          </div>
                      ) : (
                          // Jika tidak ada gambar
                          <div className="bg-[#FAF3E0] w-full aspect-video rounded-lg flex items-center justify-center border-2 border-[#B8A361]">
                            <span className="text-[#8B7D3F]">Tidak Ada Gambar</span>
                          </div>
                      )}

                      {/* Tambahan caption untuk gambar */}
                      {(selectedItemDetails.id_custom && selectedItemDetails.gambar_model) || selectedItemDetails.gambar ? (
                          <p className="text-center text-sm text-[#8B7D3F] italic mt-2">
                            Klik gambar untuk memperbesar
                          </p>
                      ) : null}
                    </div>
                ) : (
                    <div className="bg-[#FAF3E0] w-full aspect-video rounded-lg flex items-center justify-center border-2 border-[#B8A361]">
                      <span className="text-[#8B7D3F]">Tidak Ada Data</span>
                    </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog untuk memperbesar gambar */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-[#FFF8E7] max-w-5xl p-0">
            <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-[#8B7D3F] bg-opacity-75 p-4">
              <DialogTitle className="text-[#FFF8E7]">
                Detail Gambar Kue
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center w-full h-full">
              <img
                  src={selectedImage}
                  alt="Gambar Kue Diperbesar"
                  className="w-full h-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog untuk konfirmasi pembayaran kurang */}
        <Dialog
            open={showConfirmPaymentDialog}
            onOpenChange={setShowConfirmPaymentDialog}>
          <DialogContent className="bg-[#FFF8E7] border-[#B8A361] border">
            <DialogHeader>
              <DialogTitle className="text-[#D4AF37]">
                Pembayaran Kurang
              </DialogTitle>
            </DialogHeader>
            <div className="text-center my-6">
              <div className="text-[#8B7D3F] mb-2">
                Pembayaran kurang sebesar:
              </div>
              <div className="text-[#D4AF37] text-3xl font-bold my-4">
                Rp {sisaHutang.toLocaleString()}
              </div>
              <div className="text-[#8B7D3F] mt-2">
                Pesanan akan dianggap DP dan harus dilunasi pada saat pengambilan.
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                  onClick={() => setShowConfirmPaymentDialog(false)}
                  className="bg-[#FAF3E0] text-[#D4AF33] border-[#B8A361] border hover:bg-[#E6BE8A] hover:text-[#8B7D3F] transition-colors">
                Batal
              </Button>
              <Button
                  onClick={() => {
                    setShowConfirmPaymentDialog(false);
                    simpanPesanan();
                  }}
                  className="bg-[#D4AF37] text-white hover:bg-[#C5B358] hover:border-[#C5B358] transition-colors">
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
        {/* Tambahkan komponen toast */}
        <ToastNotification />
      </div>
  );
};

export default TransaksiPOSNurCake;
