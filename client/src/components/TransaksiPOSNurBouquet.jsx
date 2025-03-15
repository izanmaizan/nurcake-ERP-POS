import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Trash2, Save } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert";

const TransaksiPOSNurBouquet = ({
  selectedProduk,
  totalHarga,
  handleJumlahProdukChange,
  handleRemoveProduk,
  handleJumlahDibayarChange,
  handleSubmitOrder,
}) => {
  const [bayarCashOrDP, setBayarCashOrDP] = useState("Cash");
  const [tanggalTransaksi, setTanggalTransaksi] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tanggalPengambilan, setTanggalPengambilan] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");
  const [jumlahDibayar, setJumlahDibayar] = useState(0);
  const [kembalian, setKembalian] = useState(0);
  const [utang, setUtang] = useState(0);
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState("12:00");
  const [showKembalianDialog, setShowKembalianDialog] = useState(false);
  const [finalKembalian, setFinalKembalian] = useState(0);

  useEffect(() => {
    if (jumlahDibayar >= totalHarga) {
      setStatusPembayaran("Lunas");
      setKembalian(jumlahDibayar - totalHarga);
      setFinalKembalian(jumlahDibayar - totalHarga);
      setUtang(0);
    } else {
      setStatusPembayaran("Belum Lunas");
      setKembalian(0);
      setFinalKembalian(0);
      setUtang(totalHarga - jumlahDibayar);
    }
  }, [jumlahDibayar, totalHarga]);

  const handleLocalJumlahDibayarChange = (value) => {
    setJumlahDibayar(value);
    handleJumlahDibayarChange(value);
  };

  const handleJualProduk = () => {
    if (!tanggalPengambilan) {
      alert("Mohon isi tanggal pengambilan!");
      return;
    }

    if (!namaPelanggan || !noTelepon) {
      alert("Mohon isi nama pelanggan dan nomor telepon!");
      return;
    }

    if (jumlahDibayar < totalHarga) {
      const konfirmasi = window.confirm(
        `Pembayaran belum lunas. Sisa utang: Rp ${utang.toLocaleString()}. Apakah Anda ingin melanjutkan?`
      );
      if (!konfirmasi) return;
    }

    // Jika ada kembalian, tampilkan dialog konfirmasi
    if (kembalian > 0) {
      setShowKembalianDialog(true);
      return;
    }

    // Jika tidak ada kembalian, langsung proses transaksi
    submitTransaksi(0);
  };

  const submitTransaksi = (finalKembalianValue) => {
    const orderData = {
      selectedProduk,
      totalHarga,
      jumlahDibayar,
      statusPembayaran,
      utang,
      bayarCashOrDP,
      tanggalTransaksi,
      tanggalPengambilan,
      waktu_pengambilan: pickupTime,
      kembalian: finalKembalianValue,
      nama_pelanggan: namaPelanggan,
      no_telepon: noTelepon,
      catatan: notes,
    };

    handleSubmitOrder(orderData);
  };

  const handleKembalianConfirm = (sudahDiberikan) => {
    setShowKembalianDialog(false);
    const finalKembalianValue = sudahDiberikan ? 0 : kembalian;
    submitTransaksi(finalKembalianValue);
  };

  return (
    // TransaksiPOSNurBouquet
    <section>
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
                  Nama Pelanggan
                </label>
                <Input
                  type="text"
                  value={namaPelanggan}
                  onChange={(e) => setNamaPelanggan(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                  className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#DAA520] mb-2 block">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  placeholder="Masukkan nomor telepon"
                  className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                />
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
                  {Array.isArray(selectedProduk) &&
                  selectedProduk.length > 0 ? (
                    selectedProduk.map((item) => (
                      <tr key={item.id} className="hover:bg-[#3d3d3d]">
                        <td className="px-6 py-4 text-sm text-[#DAA520]">
                          {item.nama}
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            min="1"
                            max={item.stok || 99}
                            value={item.jumlah}
                            onChange={(e) =>
                              handleJumlahProdukChange(
                                item.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-24 bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-[#DAA520]">
                          Rp {item.harga.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#DAA520]">
                          Rp {(item.harga * item.jumlah).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveProduk(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-[#DAA520]">
                        Tidak ada produk yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#DAA520] mb-4">
              Catatan
            </h3>
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
                        bayarCashOrDP === "Cash"
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#3d3d3d] text-[#DAA520]"
                      }`}
                      onClick={() => setBayarCashOrDP("Cash")}>
                      Cash
                    </Button>
                    <Button
                      className={`flex-1 ${
                        bayarCashOrDP === "DP"
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#3d3d3d] text-[#DAA520]"
                      }`}
                      onClick={() => setBayarCashOrDP("DP")}>
                      DP
                    </Button>
                  </div>

                  {/* Input Pembayaran */}
                  <div>
                    <p className="text-sm font-medium text-[#DAA520] mb-2">
                      {bayarCashOrDP === "Cash"
                        ? "Jumlah Dibayar"
                        : "Jumlah DP"}
                    </p>
                    <Input
                      type="number"
                      value={jumlahDibayar}
                      onChange={(e) =>
                        handleLocalJumlahDibayarChange(Number(e.target.value))
                      }
                      className="w-full mb-2 bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                      min="0"
                    />
                  </div>

                  {/* Informasi Pembayaran */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#DAA520]">
                      Status Pembayaran: {statusPembayaran}
                    </p>
                    {utang > 0 && (
                      <p className="text-red-500 font-medium">
                        Sisa Utang: Rp {utang.toLocaleString()}
                      </p>
                    )}
                    {kembalian > 0 && (
                      <p className="text-[#FFD700] font-medium">
                        Kembalian: Rp {kembalian.toLocaleString()}
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
                      onChange={(e) => setTanggalTransaksi(e.target.value)}
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
                      onChange={(e) => setTanggalPengambilan(e.target.value)}
                      className="w-full bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]"
                      min={tanggalTransaksi}
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
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleJualProduk}
              disabled={!selectedProduk.length}
              className="w-full md:w-auto px-8 py-3 bg-[#FFD700] hover:bg-[#DAA520] text-black">
              <Save className="w-4 h-4 mr-2" />
              Simpan Pesanan
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={showKembalianDialog}
        onOpenChange={setShowKembalianDialog}>
        <AlertDialogContent className="bg-[#2d2d2d] border-[#FFD700]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#FFD700]">
              Konfirmasi Kembalian
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#DAA520]">
              Kembalian sebesar Rp {kembalian.toLocaleString()}. Apakah
              kembalian sudah diberikan kepada pelanggan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleKembalianConfirm(false)}
              className="bg-[#3d3d3d] text-[#DAA520] hover:bg-[#4d4d4d]">
              Belum Diberikan
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleKembalianConfirm(true)}
              className="bg-[#FFD700] text-black hover:bg-[#DAA520]">
              Sudah Diberikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default TransaksiPOSNurBouquet;
