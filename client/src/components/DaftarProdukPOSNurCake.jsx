import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Search, Cake, Package, Plus, Trash2 } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import KueReady from "../components/KueReady.jsx";

const DaftarProduk = ({ handleAddProduk, selectedProduk, onKueReadyReturn, refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // Add new state for additional cost form visibility
  const [isAdditionalCostVisible, setIsAdditionalCostVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    jenis_kue: "",
    variasi_kue: "",
    ukuran_kue: "",
    kotak_kue: "",
    jumlah_pesanan: 1,
    catatan_request: "",
    gambar_model: null,
    status: "pending",
    biaya_tambahan: [],
  });
  const [loadingProduk, setLoadingProduk] = useState(true);
  const [produkList, setProdukList] = useState([]);
  const [kueReadyList, setKueReadyList] = useState([]);
  const [isKueReadyModalOpen, setIsKueReadyModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [selectedKue, setSelectedKue] = useState(null);
  const [cakeName, setCakeName] = useState("");

  const [categories, setCategories] = useState([]);

  const [hargaRules, setHargaRules] = useState([]);
  const [jenisKueOptions, setJenisKueOptions] = useState([]);
  const [variasiKueOptions, setVariasiKueOptions] = useState([]);
  const [ukuranKueOptions, setUkuranKueOptions] = useState([]);
  const [kotakKueOptions, setKotakKueOptions] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [hargaDasar, setHargaDasar] = useState(0);
  const [isCustomCakeOrderVisible, setIsCustomCakeOrderVisible] =
    useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProdukList();
    fetchKueReadyList();
  }, []);

  // Fetch daftar kategori
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/kategori-produk");
      setCategories(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar kategori:", error);
    }
  };

  const fetchProdukList = async () => {
    setLoadingProduk(true);
    try {
      const response = await axios.get("http://localhost:3000/produkNC");
      setProdukList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar produk:", error);
      alert("Gagal mengambil daftar produk.");
    } finally {
      setLoadingProduk(false);
    }
  };

  // Tambahkan useEffect untuk memantau perubahan pada selectedProduk
  // useEffect(() => {
  //   // Filter kueReadyList untuk menghapus item yang sudah terpilih
  //   if (selectedProduk && selectedProduk.length > 0) {
  //     const filteredKueReadyList = kueReadyList.filter(
  //       (kue) =>
  //         !selectedProduk.some((selected) => selected.id_kue === kue.id_kue)
  //     );
  //
  //     if (filteredKueReadyList.length !== kueReadyList.length) {
  //       setKueReadyList(filteredKueReadyList);
  //     }
  //   }
  // }, [selectedProduk]);

  // Tambahkan fungsi ini untuk menghapus kue dari tampilan dan database
  const removeKueFromList = async (kueId) => {
    try {
      // Hapus dari database
      await axios.delete(`http://localhost:3000/kue-ready/${kueId}`);

      // Hapus dari state lokal
      setKueReadyList(kueReadyList.filter((kue) => kue.id_kue !== kueId));

      // Tampilkan notifikasi
      alert("Kue berhasil dihapus dari stok");
    } catch (error) {
      console.error("Error removing kue from list:", error);
      alert("Gagal menghapus kue dari stok");
    }
  };

  // Filter produk berdasarkan pencarian dan kategori
  const filteredProduk = produkList.filter((produk) => {
    const matchesSearch = produk.nama_produk
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? produk.nama_kategori === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // Fungsi untuk mengambil daftar kue ready
  const fetchKueReadyList = async () => {
    try {
      const response = await axios.get("http://localhost:3000/kue-ready");
      setKueReadyList(response.data || []);
    } catch (error) {
      console.error("Error fetching kue ready list:", error);
    }
  };

  // Jalankan fetchKueReadyList setiap kali refreshTrigger berubah
  useEffect(() => {
    fetchKueReadyList();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchHargaRules();
  }, []);

  const fetchHargaRules = async () => {
    try {
      const response = await axios.get("http://localhost:3000/harga-kue");
      setHargaRules(response.data);

      // Ekstrak unique jenis kue untuk dropdown pertama
      const uniqueJenisKue = [
        ...new Set(response.data.map((rule) => rule.jenis_kue)),
      ];
      setJenisKueOptions(uniqueJenisKue);

      // Reset dropdown lainnya saat rules berubah
      setFilteredRules([]);

      // Reset selection jika rules berubah
      setOrderDetails((prev) => ({
        ...prev,
        variasi_kue: "",
        ukuran_kue: "",
        kotak_kue: "",
      }));
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  // Reset seleksi saat jenis kue berubah
  useEffect(() => {
    if (orderDetails.jenis_kue) {
      // Filter rules berdasarkan jenis kue yang dipilih
      const rulesForSelectedJenis = hargaRules.filter(
        (rule) => rule.jenis_kue === orderDetails.jenis_kue
      );

      // Update filteredRules
      setFilteredRules(rulesForSelectedJenis);

      // Update variasi options
      const uniqueVariasi = [
        ...new Set(rulesForSelectedJenis.map((rule) => rule.variasi)),
      ];
      setVariasiKueOptions(uniqueVariasi);

      // Reset selection untuk dropdown berikutnya
      setOrderDetails((prev) => ({
        ...prev,
        variasi_kue: "",
        ukuran_kue: "",
        kotak_kue: "",
      }));

      // Reset options for next dropdowns
      setUkuranKueOptions([]);
      setKotakKueOptions([]);
    } else {
      // Jika tidak ada jenis kue yang dipilih, kosongkan semua dropdown berikutnya
      setVariasiKueOptions([]);
      setUkuranKueOptions([]);
      setKotakKueOptions([]);
      setFilteredRules([]);
    }
  }, [orderDetails.jenis_kue, hargaRules]);

  // Perbarui useEffect untuk variasi_kue
  useEffect(() => {
    if (orderDetails.jenis_kue && orderDetails.variasi_kue) {
      // Filter rules berdasarkan jenis dan variasi yang dipilih
      const rulesForSelectedVariasi = filteredRules.filter(
        (rule) => rule.variasi === orderDetails.variasi_kue
      );

      // Update ukuran options
      const uniqueUkuran = [
        ...new Set(rulesForSelectedVariasi.map((rule) => rule.ukuran)),
      ];
      setUkuranKueOptions(uniqueUkuran);

      // Reset selection untuk ukuran dan kotak
      setOrderDetails((prev) => ({
        ...prev,
        ukuran_kue: "",
        kotak_kue: "",
      }));

      // Reset kotak options
      setKotakKueOptions([]);
    } else if (orderDetails.jenis_kue && !orderDetails.variasi_kue) {
      // Jika variasi belum dipilih, kosongkan ukuran dan kotak
      setUkuranKueOptions([]);
      setKotakKueOptions([]);
    }
  }, [orderDetails.variasi_kue, filteredRules]);

  // Perbarui useEffect untuk ukuran_kue
  useEffect(() => {
    if (
      orderDetails.jenis_kue &&
      orderDetails.variasi_kue &&
      orderDetails.ukuran_kue
    ) {
      // Filter rules berdasarkan jenis, variasi, dan ukuran yang dipilih
      const rulesForSelectedUkuran = filteredRules.filter(
        (rule) =>
          rule.variasi === orderDetails.variasi_kue &&
          rule.ukuran === orderDetails.ukuran_kue
      );

      // Update kotak options
      const uniqueKotak = [
        ...new Set(rulesForSelectedUkuran.map((rule) => rule.kotak)),
      ];
      setKotakKueOptions(uniqueKotak);

      // Reset selection untuk kotak
      setOrderDetails((prev) => ({
        ...prev,
        kotak_kue: "",
      }));
    } else if (
      orderDetails.jenis_kue &&
      orderDetails.variasi_kue &&
      !orderDetails.ukuran_kue
    ) {
      // Jika ukuran belum dipilih, kosongkan kotak
      setKotakKueOptions([]);
    }
  }, [orderDetails.ukuran_kue, filteredRules]);

  // Perbarui useEffect untuk kotak_kue
  useEffect(() => {
    if (orderDetails.jenis_kue && hargaRules.length > 0) {
      const filteredRules = hargaRules.filter(
        (rule) => rule.jenis_kue === orderDetails.jenis_kue
      );
      const uniqueKotak = [...new Set(filteredRules.map((rule) => rule.kotak))];
      setKotakKueOptions(uniqueKotak);
    }
  }, [orderDetails.jenis_kue, hargaRules]);

  // Hitung harga ketika semua detail sudah dipilih
  useEffect(() => {
    calculateTotalHarga();
  }, [orderDetails]);

  const calculateTotalHarga = () => {
    const {
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      kotak_kue,
      jumlah_pesanan,
      biaya_tambahan,
    } = orderDetails;

    // Cari rule yang cocok dengan semua pilihan
    const matchingRule = hargaRules.find(
      (rule) =>
        rule.jenis_kue === jenis_kue &&
        rule.variasi === variasi_kue &&
        rule.ukuran === ukuran_kue &&
        rule.kotak === kotak_kue
    );

    if (matchingRule) {
      const baseHarga = parseFloat(matchingRule.harga);
      setHargaDasar(baseHarga);

      // Hitung total biaya tambahan
      const totalAdditionalCost = biaya_tambahan.reduce((sum, item) => {
        return sum + parseFloat(item.harga_item) * parseInt(item.jumlah_item);
      }, 0);

      const totalWithExtras =
        baseHarga * parseInt(jumlah_pesanan || 1) + totalAdditionalCost;
      setTotalHarga(totalWithExtras);
    } else {
      setHargaDasar(0);
      setTotalHarga(0);
    }
  };

  useEffect(() => {
    const calculatePrice = async () => {
      const {
        jenis_kue,
        variasi_kue,
        ukuran_kue,
        kotak_kue,
        jumlah_pesanan,
        biaya_tambahan,
      } = orderDetails;

      if (jenis_kue && variasi_kue && ukuran_kue && kotak_kue) {
        const matchingRule = hargaRules.find(
          (rule) =>
            rule.jenis_kue === orderDetails.jenis_kue &&
            rule.variasi === orderDetails.variasi_kue &&
            rule.ukuran === orderDetails.ukuran_kue &&
            rule.kotak === orderDetails.kotak_kue
        );

        if (matchingRule) {
          const basePrice = parseFloat(matchingRule.harga);
          setHargaDasar(basePrice);

          // Hitung total biaya tambahan
          const totalAdditionalCost = biaya_tambahan.reduce((sum, item) => {
            return (
              sum + parseFloat(item.harga_item) * parseInt(item.jumlah_item)
            );
          }, 0);

          // Hitung total keseluruhan
          const total =
            basePrice * parseInt(jumlah_pesanan) + totalAdditionalCost;
          setTotalHarga(total);
        }
      }
    };

    calculatePrice();
  }, [orderDetails, hargaRules]);

  const handleKueSelection = (kue) => {
    setSelectedKue(kue);
    setIsNameModalOpen(true);
  };

  // State untuk form biaya tambahan
  const [additionalItemForm, setAdditionalItemForm] = useState({
    nama_item: "",
    jumlah_item: 1,
    harga_item: 0,
  });

  // Fungsi untuk menangani perubahan form biaya tambahan
  const handleAdditionalItemChange = (e) => {
    const { name, value } = e.target;
    setAdditionalItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk menambah item tambahan
  const handleAddAdditionalItem = () => {
    if (additionalItemForm.nama_item && additionalItemForm.harga_item > 0) {
      setOrderDetails((prev) => ({
        ...prev,
        biaya_tambahan: [...prev.biaya_tambahan, { ...additionalItemForm }],
      }));
      // Reset form
      setAdditionalItemForm({
        nama_item: "",
        jumlah_item: 1,
        harga_item: 0,
      });
    }
  };

  // Fungsi untuk menghapus item tambahan
  const handleRemoveAdditionalItem = (index) => {
    setOrderDetails((prev) => ({
      ...prev,
      biaya_tambahan: prev.biaya_tambahan.filter((_, i) => i !== index),
    }));
  };

  const handleNameSubmit = () => {
    if (selectedKue) {
      handleAddProduk({
        ...selectedKue,
        cake_name: cakeName || "Tanpa Nama",
      });
      setIsNameModalOpen(false);
      setCakeName("");
      setSelectedKue(null);
    }
  };

  const filteredKueReady = kueReadyList.filter((kue) => {
    const matchesSearch = kue.jenis_kue
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Function to toggle additional cost form visibility
  const toggleAdditionalCostForm = () => {
    setIsAdditionalCostVisible(!isAdditionalCostVisible);
  };

  // Function to handle canceling additional cost
  const handleCancelAdditionalCost = () => {
    setIsAdditionalCostVisible(false);
    setAdditionalItemForm({
      nama_item: "",
      jumlah_item: 1,
      harga_item: 0,
    });
  };

  const handleOrderChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setOrderDetails((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setOrderDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the matching rule to get the modal (cost price)
      const matchingRule = hargaRules.find(
        (rule) =>
          rule.jenis_kue === orderDetails.jenis_kue &&
          rule.variasi === orderDetails.variasi_kue &&
          rule.ukuran === orderDetails.ukuran_kue &&
          rule.kotak === orderDetails.kotak_kue
      );

      // Hitung total biaya tambahan
      const totalBiayaTambahan = orderDetails.biaya_tambahan.reduce(
        (sum, item) => {
          return sum + parseFloat(item.harga_item) * parseInt(item.jumlah_item);
        },
        0
      );

      // Handle file upload
      let gambarBase64 = null;
      if (orderDetails.gambar_model) {
        const reader = new FileReader();
        // Convert file to base64
        await new Promise((resolve, reject) => {
          reader.onload = resolve;
          reader.onerror = reject;
          reader.readAsDataURL(orderDetails.gambar_model);
        });
        gambarBase64 = reader.result;
      }

      const customCake = {
        id_custom: Date.now(),
        jenis_kue: orderDetails.jenis_kue,
        variasi_kue: orderDetails.variasi_kue,
        ukuran_kue: orderDetails.ukuran_kue,
        kotak_kue: orderDetails.kotak_kue,
        jumlah_pesanan: parseInt(orderDetails.jumlah_pesanan),
        catatan_request: orderDetails.catatan_request,
        // Simpan harga_jual asli (tanpa dikalikan jumlah pesanan)
        harga_jual: matchingRule ? parseFloat(matchingRule.harga) : 0,
        // Simpan modal asli (tanpa dikalikan jumlah pesanan)
        modal: matchingRule ? parseFloat(matchingRule.modal) : 0,
        // Tambah field baru untuk total keseluruhan
        total_harga: totalHarga, // Total harga sudah termasuk jumlah pesanan dan biaya tambahan
        // Tambah field baru untuk total modal
        total_modal: matchingRule
          ? parseFloat(matchingRule.modal) *
            parseInt(orderDetails.jumlah_pesanan)
          : 0,
        biaya_tambahan: orderDetails.biaya_tambahan,
        total_biaya_tambahan: totalBiayaTambahan,
        tipe: "custom_cake",
        // Tambahkan gambar model ke objek kue
        gambar_model: gambarBase64
      };

      handleAddProduk(customCake);

      // Reset form
      setOrderDetails({
        jenis_kue: "",
        variasi_kue: "",
        ukuran_kue: "",
        kotak_kue: "",
        jumlah_pesanan: 1,
        catatan_request: "",
        gambar_model: null,
        status: "pending",
        biaya_tambahan: [],
      });
      setIsCustomCakeOrderVisible(false);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Gagal membuat pesanan");
    }
  };

  const handleKueReadySubmit = async (formData) => {
    try {
      await axios.post("http://localhost:3000/kue-ready", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Kue berhasil ditambahkan!");
      fetchKueReadyList();
      setIsKueReadyModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal menambahkan kue");
    }
  };

  // Check if a kue ready is already selected
  const isKueReadySelected = (kueId) => {
    return selectedProduk && selectedProduk.some((item) => item.id_kue === kueId);
  };

  // Fungsi untuk mengatur status tombol dan form
  const handleToggleCustomCakeOrder = () => {
    if (isCustomCakeOrderVisible) {
      setOrderDetails({
        jenis_kue: "",
        variasi_kue: "",
        ukuran_kue: "",
        kotak_kue: "",
        jumlah_pesanan: "",
        biaya_tambahan: "",
        tanggal_pengambilan: "",
        jam_pengambilan: "",
        catatan_biaya_tambahan: "",
        catatan_request: "",
        gambar_model: null,
      });
    }
    setIsCustomCakeOrderVisible((prev) => !prev);
  };
  return (
    // Daftar Produk POS Nur Cake
    <section className="space-y-8">
      {/*<div className="flex items-center justify-between">*/}
      {/*  <h2 className="text-3xl font-bold text-[#FFD700]">Daftar Produk</h2>*/}
      {/*</div>*/}

      {/* Custom Cake Order Section */}
      <Card className="bg-[#2d2d2d] border-[#FFD700] border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#FFD700]">
            <Cake className="h-6 w-6 text-[#FFD700]" />
            Pesan Kue
          </CardTitle>
        </CardHeader>

        {/* Custom Cake Order Button */}
        <div className="flex justify-start mx-4 mb-2">
          {!isCustomCakeOrderVisible && (
            <Button
              onClick={handleToggleCustomCakeOrder}
              className="mt-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
              <Plus className="h-4 w-4 mr-2 " />
              Buat Pesanan
            </Button>
          )}
        </div>

        {/* Form only visible when the button is clicked */}
        <CardContent
          className={`transition-all duration-500 ease-in-out ${
            isCustomCakeOrderVisible
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Jenis Kue */}
              <div className="space-y-2">
                <Label htmlFor="jenis_kue" className="text-[#DAA520]">
                  Jenis Kue
                </Label>
                <select
                  id="jenis_kue"
                  name="jenis_kue"
                  value={orderDetails.jenis_kue}
                  onChange={handleOrderChange}
                  className="w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border border-[#FFD700]">
                  <option value="">Pilih Jenis Kue</option>
                  {jenisKueOptions.map((jenis, index) => (
                    <option key={index} value={jenis}>
                      {jenis}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variasi Kue - Hanya aktif jika jenis kue sudah dipilih */}
              <div className="space-y-2">
                <Label htmlFor="variasi_kue" className="text-[#DAA520]">
                  Variasi Kue
                </Label>
                <select
                  id="variasi_kue"
                  name="variasi_kue"
                  value={orderDetails.variasi_kue}
                  onChange={handleOrderChange}
                  disabled={!orderDetails.jenis_kue}
                  className={`w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border ${
                    orderDetails.jenis_kue
                      ? "border-[#FFD700]"
                      : "border-gray-600 opacity-50"
                  }`}>
                  <option value="">Pilih Variasi Kue</option>
                  {variasiKueOptions.map((variasi, index) => (
                    <option key={index} value={variasi}>
                      {variasi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ukuran Kue - Hanya aktif jika variasi kue sudah dipilih */}
              <div className="space-y-2">
                <Label htmlFor="ukuran_kue" className="text-[#DAA520]">
                  Ukuran Kue
                </Label>
                <select
                  id="ukuran_kue"
                  name="ukuran_kue"
                  value={orderDetails.ukuran_kue}
                  onChange={handleOrderChange}
                  disabled={!orderDetails.variasi_kue}
                  className={`w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border ${
                    orderDetails.variasi_kue
                      ? "border-[#FFD700]"
                      : "border-gray-600 opacity-50"
                  }`}>
                  <option value="">Pilih Ukuran Kue</option>
                  {ukuranKueOptions.map((ukuran, index) => (
                    <option key={index} value={ukuran}>
                      {ukuran}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kotak Kue - Hanya aktif jika ukuran kue sudah dipilih */}
              <div className="space-y-2">
                <Label htmlFor="kotak_kue" className="text-[#DAA520]">
                  Kotak Kue
                </Label>
                <select
                  id="kotak_kue"
                  name="kotak_kue"
                  value={orderDetails.kotak_kue}
                  onChange={handleOrderChange}
                  disabled={!orderDetails.ukuran_kue}
                  className={`w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border ${
                    orderDetails.ukuran_kue
                      ? "border-[#FFD700]"
                      : "border-gray-600 opacity-50"
                  }`}>
                  <option value="">Pilih Kotak Kue</option>
                  {kotakKueOptions.map((kotak, index) => (
                    <option key={index} value={kotak}>
                      {kotak}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jumlah Pesanan */}
              <div className="space-y-2">
                <Label htmlFor="jumlah_pesanan" className="text-[#DAA520]">
                  Jumlah Pesanan
                </Label>
                <Input
                  type="number"
                  id="jumlah_pesanan"
                  name="jumlah_pesanan"
                  min="1"
                  value={orderDetails.jumlah_pesanan}
                  onChange={handleOrderChange}
                  className="bg-[#1a1a1a] text-[#DAA520] border-[#FFD700]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gambar_model" className="text-[#DAA520]">
                  Unggah Gambar Model
                </Label>
                <Input
                  type="file"
                  id="gambar_model"
                  name="gambar_model"
                  accept="image/*"
                  onChange={handleOrderChange}
                  className="bg-[#1a1a1a] text-[#DAA520] border-[#FFD700]"
                />
              </div>
            </div>

            {/* Form Biaya Tambahan */}
            <div
              className={`border-t border-[#FFD700] pt-4 mt-4 ${isAdditionalCostVisible ? "space-y-4" : "space-y-2"}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#FFD700]">Biaya Tambahan</h3>
                {!isAdditionalCostVisible && (
                  <Button
                    type="button"
                    onClick={toggleAdditionalCostForm}
                    className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Biaya
                  </Button>
                )}
              </div>

              {/* Collapsible Additional Cost Form */}
              {isAdditionalCostVisible && (
                <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-lg border border-[#FFD700]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nama_item" className="text-[#DAA520]">
                        Nama Item
                      </Label>
                      <Input
                        id="nama_item"
                        name="nama_item"
                        value={additionalItemForm.nama_item}
                        onChange={handleAdditionalItemChange}
                        placeholder="Nama item tambahan"
                        className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jumlah_item" className="text-[#DAA520]">
                        Jumlah
                      </Label>
                      <Input
                        type="number"
                        id="jumlah_item"
                        name="jumlah_item"
                        min="1"
                        value={additionalItemForm.jumlah_item}
                        onChange={handleAdditionalItemChange}
                        className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="harga_item" className="text-[#DAA520]">
                        Harga per Item
                      </Label>
                      <Input
                        type="number"
                        id="harga_item"
                        name="harga_item"
                        min="0"
                        value={additionalItemForm.harga_item}
                        onChange={handleAdditionalItemChange}
                        className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={handleCancelAdditionalCost}
                      className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                      Batal
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddAdditionalItem}
                      className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                      Tambah Item
                    </Button>
                  </div>
                </div>
              )}

              {/* List of Added Items */}
              {orderDetails.biaya_tambahan.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-[#FFD700]">
                    Daftar Item Tambahan:
                  </h4>
                  <div className="space-y-2">
                    {orderDetails.biaya_tambahan.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-[#FFD700]">
                        <div className="text-[#DAA520]">
                          <span className="font-medium">{item.nama_item}</span>
                          <span className="mx-2">-</span>
                          <span>
                            {item.jumlah_item} x Rp{" "}
                            {parseInt(item.harga_item).toLocaleString()}
                          </span>
                          <span className="ml-2 font-medium">
                            = Rp{" "}
                            {(
                              item.jumlah_item * item.harga_item
                            ).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdditionalItem(index)}
                          className="bg-red-500 hover:bg-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan_request" className="text-[#DAA520]">
                Catatan Request
              </Label>
              <Textarea
                id="catatan_request"
                name="catatan_request"
                value={orderDetails.catatan_request}
                onChange={handleOrderChange}
                placeholder="Masukkan detail permintaan khusus untuk kue..."
                rows={4}
                className="bg-[#1a1a1a] text-[#DAA520] border-[#FFD700]"
              />
            </div>

            {/* Harga Dasar dan Total */}
            <div className="space-y-2 border-t border-[#FFD700] pt-4">
              {hargaDasar > 0 && (
                <div className="flex justify-between text-lg">
                  <span className="text-[#DAA520]">Harga Dasar:</span>
                  <span className="font-semibold text-[#FFD700]">
                    Rp {hargaDasar.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg">
                <span className="text-[#DAA520]">Total Harga:</span>
                <span className="font-semibold text-[#FFD700]">
                  Rp {totalHarga.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              {isCustomCakeOrderVisible && (
                <Button
                  onClick={handleToggleCustomCakeOrder}
                  className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                  Batal Buat Pesanan
                </Button>
              )}
              <Button
                type="submit"
                className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                <Plus className="h-4 w-4 mr-2" />
                Kirim Pesanan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Kue Ready Section */}
      <Card className="bg-[#2d2d2d] border-[#FFD700] border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#FFD700]">
            <Cake className="h-5 w-5 text-[#FFD700]" />
            Kue Stok
          </CardTitle>
          <Button
            onClick={() => setIsKueReadyModalOpen(true)}
            className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kue Stok
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKueReady.map((kue) => {
              const isSelected = isKueReadySelected(kue.id_kue);
              return (
                <Card
                    key={kue.id_kue}
                    className={`overflow-hidden bg-[#1a1a1a] border border-[#FFD700] ${
                        isKueReadySelected(kue.id_kue) ? "opacity-50" : ""
                    }`}>
                  <div className="aspect-square relative">
                    {kue.gambar ? (
                      <img
                        src={`http://localhost:3000/${kue.gambar}`}
                        alt={kue.jenis_kue}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#2d2d2d]">
                        <Cake className="h-12 w-12 text-[#FFD700]" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">
                      {kue.jenis_kue}
                    </h3>
                    <div className="space-y-2 text-sm text-[#DAA520]">
                      <p>Variasi: {kue.variasi_kue}</p>
                      <p>Ukuran: {kue.ukuran_kue}</p>
                      <p>Aksesoris: {kue.aksesoris_kue || "Tidak ada"}</p>
                      <p className="text-lg font-bold text-[#FFD700]">
                        Rp {parseFloat(kue.harga_jual).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                          onClick={() => handleKueSelection(kue)}
                          className="flex-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]"
                          disabled={isKueReadySelected(kue.id_kue)}>
                        {isKueReadySelected(kue.id_kue) ? "Sudah Dipilih" : "Tambah"}
                      </Button> 
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Apakah Anda yakin ingin menghapus kue ini dari stok?"
                            )
                          ) {
                            removeKueFromList(kue.id_kue);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 border border-[#FFD700]" disabled={isKueReadySelected(kue.id_kue)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <KueReady
        isOpen={isKueReadyModalOpen}
        onClose={() => setIsKueReadyModalOpen(false)}
        onSubmit={handleKueReadySubmit}
        onSuccess={fetchKueReadyList}
      />

      {/* Name Modal */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#2d2d2d] border border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-[#FFD700]">
              Nama yang Akan Ditulis di Kue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Masukkan nama yang akan ditulis di kue"
              value={cakeName}
              onChange={(e) => setCakeName(e.target.value)}
              className="bg-[#1a1a1a] text-[#DAA520] border-[#FFD700]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNameModalOpen(false);
                  setCakeName("");
                  setSelectedKue(null);
                }}
                className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                Batal
              </Button>
              <Button
                onClick={handleNameSubmit}
                className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Products Section */}
      {loadingProduk ? (
        <p className="text-[#DAA520]">Loading daftar produk...</p>
      ) : (
        <div className="space-y-8">
          {/* Bagian Produk Lainnya dengan Search dan Filter */}
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#FFD700]">
                <Package className="h-6 w-6 text-[#FFD700]" />
                Produk Lainnya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Section */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#DAA520]" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Produk..."
                    className="pl-10 bg-[#1a1a1a] text-[#DAA520] border-[#FFD700]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]">
                  <option value="">Semua Kategori</option>
                  {categories.map((category) => (
                    <option
                      key={category.id_kategori}
                      value={category.nama_kategori}>
                      {category.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produk Grid */}
              {loadingProduk ? (
                <p className="text-[#DAA520]">Loading daftar produk...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProduk.map((produk) => (
                    <Card
                      key={produk.id_produk}
                      className="overflow-hidden group bg-[#1a1a1a] border border-[#FFD700]">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={`http://localhost:3000/${produk.gambar}`}
                          alt={produk.nama_produk}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-[#FFD700]">
                          {produk.nama_produk}
                        </h3>
                        <p className="text-[#FFD700] font-medium mb-1">
                          Rp {produk.harga_jual.toLocaleString()}
                        </p>
                        <p className="text-[#DAA520] text-sm mb-4">
                          Stok: {produk.jumlah_stok}
                        </p>
                        <Button
                          onClick={() => handleAddProduk(produk)}
                          className="w-full bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
                          <span className="flex items-center">Tambah</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};

export default DaftarProduk;
