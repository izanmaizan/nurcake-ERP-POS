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


// Konstanta API
const API = import.meta.env.VITE_API || "http://localhost:3000";

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
    gambar_model: [],
    status: "pending",
    biaya_tambahan: [],
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isKueReadyVisible, setIsKueReadyVisible] = useState(false);
  const [isProdukVisible, setIsProdukVisible] = useState(false);
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
  const [imagePreview, setImagePreview] = useState(null);
  const [isCustomCakeOrderVisible, setIsCustomCakeOrderVisible] =
    useState(false);

  // Tambahkan useEffect untuk mendeteksi ukuran layar
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);

      // Jika mobile view, tutup section-section
      if (window.innerWidth < 768) {
        setIsKueReadyVisible(false);
        setIsProdukVisible(false);
      } else {
        // Jika desktop view, buka section-section
        setIsKueReadyVisible(true);
        setIsProdukVisible(true);
      }
    };

    // Cek saat pertama kali load
    checkMobileView();

    // Tambahkan event listener untuk resize
    window.addEventListener('resize', checkMobileView);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProdukList();
    fetchKueReadyList();
  }, []);

  // Fetch daftar kategori
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/kategori-produk`);
      setCategories(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar kategori:", error);
    }
  };

  const fetchProdukList = async () => {
    setLoadingProduk(true);
    try {
      const response = await axios.get(`${API}/produkNC`);
      setProdukList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar produk:", error);
      alert("Gagal mengambil daftar produk.");
    } finally {
      setLoadingProduk(false);
    }
  };

  // Tambahkan fungsi ini untuk menghapus kue dari tampilan dan database
  const removeKueFromList = async (kueId) => {
    try {
      // Hapus dari database
      await axios.delete(`${API}/kue-ready/${kueId}`);

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
      const response = await axios.get(`${API}/kue-ready`);
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
      const response = await axios.get(`${API}/harga-kue`);
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
    if (type === "file" && name === "gambar_model") {
      // Konversi FileList ke array
      const fileArray = Array.from(files);

      // Pastikan prev.gambar_model adalah array sebelum menggunakan spread operator
      setOrderDetails((prev) => ({
        ...prev,
        gambar_model: Array.isArray(prev.gambar_model)
            ? [...prev.gambar_model, ...fileArray]
            : [...fileArray],
      }));

      // Buat preview untuk setiap gambar
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Pastikan kita selalu memperlakukan imagePreview sebagai array
          setImagePreview(prev => Array.isArray(prev) ? [...prev, e.target.result] : [e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      setOrderDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleRemoveImage = (index) => {
    setOrderDetails(prev => ({
      ...prev,
      gambar_model: prev.gambar_model.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
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

      // Konversi semua gambar ke base64
      let gambarBase64Array = [];
      if (orderDetails.gambar_model.length > 0) {
        gambarBase64Array = await Promise.all(orderDetails.gambar_model.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
        }));
      }

      const customCake = {
        id_custom: Date.now(),
        jenis_kue: orderDetails.jenis_kue,
        variasi_kue: orderDetails.variasi_kue,
        ukuran_kue: orderDetails.ukuran_kue,
        kotak_kue: orderDetails.kotak_kue,
        jumlah_pesanan: parseInt(orderDetails.jumlah_pesanan),
        catatan_request: orderDetails.catatan_request,
        harga_jual: matchingRule ? parseFloat(matchingRule.harga) : 0,
        modal: matchingRule ? parseFloat(matchingRule.modal) : 0,
        total_harga: totalHarga,
        total_modal: matchingRule
            ? parseFloat(matchingRule.modal) *
            parseInt(orderDetails.jumlah_pesanan)
            : 0,
        biaya_tambahan: orderDetails.biaya_tambahan,
        total_biaya_tambahan: totalBiayaTambahan,
        tipe: "custom_cake",
        gambar_model: gambarBase64Array // Simpan array gambar base64
      };

      handleAddProduk(customCake);

      // Reset form
      resetCustomCakeForm();
      setIsCustomCakeOrderVisible(false);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Gagal membuat pesanan");
    }
  };

  const resetCustomCakeForm = () => {
    setOrderDetails({
      jenis_kue: "",
      variasi_kue: "",
      ukuran_kue: "",
      kotak_kue: "",
      jumlah_pesanan: 1,
      catatan_request: "",
      gambar_model: [],
      status: "pending",
      biaya_tambahan: [],
    });
    setImagePreview([]);
  };

  const handleKueReadySubmit = async (formData) => {
    try {
      await axios.post(`${API}/kue-ready`, formData, {
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
      resetCustomCakeForm();
    }
    setIsCustomCakeOrderVisible((prev) => !prev);
  };

  return (
      // Daftar Produk POS Nur Cake
      <section className="space-y-4 md:space-y-8">

        {/* Custom Cake Order Section */}
        <Card className="bg-[#FFF8E7] border-[#D4AF37] border overflow-hidden md:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#8B7D3F]">
              <Cake className="h-6 w-6 text-[#8B7D3F]" />
              Pesan Kue
            </CardTitle>
          </CardHeader>

          {/* Custom Cake Order Button */}
          <div className="flex justify-start mx-4 mb-2">
            {!isCustomCakeOrderVisible && (
                <Button
                    onClick={handleToggleCustomCakeOrder}
                    className="mt-1 bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                  <Plus className="h-4 w-4 mr-2 " />
                  Buat Pesanan
                </Button>
            )}
          </div>

          {/* Form only visible when the button is clicked */}
          <CardContent
              className={`transition-all duration-500 ease-in-out ${
                  isCustomCakeOrderVisible
                      ? "opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
              }`}>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jenis Kue */}
                <div className="space-y-2">
                  <Label htmlFor="jenis_kue" className="text-[#8B7D3F]">
                    Jenis Kue
                  </Label>
                  <select
                      id="jenis_kue"
                      name="jenis_kue"
                      value={orderDetails.jenis_kue}
                      onChange={handleOrderChange}
                      className="w-full p-2 rounded-md bg-[#FAF3E0] text-[#8B7D3F] border border-[#C5B358]">
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
                  <Label htmlFor="variasi_kue" className="text-[#8B7D3F]">
                    Variasi Kue
                  </Label>
                  <select
                      id="variasi_kue"
                      name="variasi_kue"
                      value={orderDetails.variasi_kue}
                      onChange={handleOrderChange}
                      disabled={!orderDetails.jenis_kue}
                      className={`w-full p-2 rounded-md bg-[#FAF3E0] text-[#8B7D3F] border ${
                          orderDetails.jenis_kue
                              ? "border-[#C5B358]"
                              : "border-gray-300 opacity-50"
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
                  <Label htmlFor="ukuran_kue" className="text-[#8B7D3F]">
                    Ukuran Kue
                  </Label>
                  <select
                      id="ukuran_kue"
                      name="ukuran_kue"
                      value={orderDetails.ukuran_kue}
                      onChange={handleOrderChange}
                      disabled={!orderDetails.variasi_kue}
                      className={`w-full p-2 rounded-md bg-[#FAF3E0] text-[#8B7D3F] border ${
                          orderDetails.variasi_kue
                              ? "border-[#C5B358]"
                              : "border-gray-300 opacity-50"
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
                  <Label htmlFor="kotak_kue" className="text-[#8B7D3F]">
                    Kotak Kue
                  </Label>
                  <select
                      id="kotak_kue"
                      name="kotak_kue"
                      value={orderDetails.kotak_kue}
                      onChange={handleOrderChange}
                      disabled={!orderDetails.ukuran_kue}
                      className={`w-full p-2 rounded-md bg-[#FAF3E0] text-[#8B7D3F] border ${
                          orderDetails.ukuran_kue
                              ? "border-[#C5B358]"
                              : "border-gray-300 opacity-50"
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
                  <Label htmlFor="jumlah_pesanan" className="text-[#8B7D3F]">
                    Jumlah Pesanan
                  </Label>
                  <Input
                      type="number"
                      id="jumlah_pesanan"
                      name="jumlah_pesanan"
                      min="1"
                      value={orderDetails.jumlah_pesanan}
                      onChange={handleOrderChange}
                      className="bg-[#FAF3E0] text-[#8B7D3F] border-[#C5B358]"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="gambar_model" className="text-[#8B7D3F]">Gambar Model (Opsional):</Label>
                  <Input
                      id="gambar_model"
                      name="gambar_model"
                      type="file"
                      multiple // Tambahkan atribut multiple
                      onChange={handleOrderChange}
                      className="mt-1 bg-[#FAF3E0] text-[#8B7D3F]"
                  />
                  <div className="text-sm text-[#B8A361]">
                    Pilih beberapa gambar sebagai referensi model kue
                  </div>
                </div>

                {/* Preview gambar */}
                {imagePreview && imagePreview.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-[#8B7D3F]">Preview Gambar Model:</Label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {imagePreview.map((preview, index) => (
                            <div key={index} className="relative border rounded overflow-hidden border-[#C5B358]">
                              <img
                                  src={preview}
                                  alt={`Preview ${index+1}`}
                                  className="max-h-40 object-contain mx-auto"
                              />
                              <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>

              {/* Form Biaya Tambahan */}
              <div
                  className={`border-t border-[#D4AF37] pt-4 mt-4 ${isAdditionalCostVisible ? "space-y-4" : "space-y-2"}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[#8B7D3F]">Biaya Tambahan</h3>
                  {!isAdditionalCostVisible && (
                      <Button
                          type="button"
                          onClick={toggleAdditionalCostForm}
                          className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Biaya
                      </Button>
                  )}
                </div>

                {/* Collapsible Additional Cost Form */}
                {isAdditionalCostVisible && (
                    <div className="space-y-4 bg-[#FAF3E0] p-4 rounded-lg border border-[#C5B358]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="nama_item" className="text-[#8B7D3F]">
                            Nama Item
                          </Label>
                          <Input
                              id="nama_item"
                              name="nama_item"
                              value={additionalItemForm.nama_item}
                              onChange={handleAdditionalItemChange}
                              placeholder="Nama item tambahan"
                              className="bg-[#FFF8E7] text-[#8B7D3F] border-[#C5B358]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="jumlah_item" className="text-[#8B7D3F]">
                            Jumlah
                          </Label>
                          <Input
                              type="number"
                              id="jumlah_item"
                              name="jumlah_item"
                              min="1"
                              value={additionalItemForm.jumlah_item}
                              onChange={handleAdditionalItemChange}
                              className="bg-[#FFF8E7] text-[#8B7D3F] border-[#C5B358]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="harga_item" className="text-[#8B7D3F]">
                            Harga per Item
                          </Label>
                          <Input
                              type="number"
                              id="harga_item"
                              name="harga_item"
                              min="0"
                              value={additionalItemForm.harga_item}
                              onChange={handleAdditionalItemChange}
                              className="bg-[#FFF8E7] text-[#8B7D3F] border-[#C5B358]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            onClick={handleCancelAdditionalCost}
                            className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                          Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddAdditionalItem}
                            className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                          Tambah Item
                        </Button>
                      </div>
                    </div>
                )}

                {/* List of Added Items */}
                {orderDetails.biaya_tambahan.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-[#8B7D3F]">
                        Daftar Item Tambahan:
                      </h4>
                      <div className="space-y-2">
                        {orderDetails.biaya_tambahan.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-[#FAF3E0] p-2 rounded border border-[#C5B358]">
                              <div className="text-[#8B7D3F]">
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
                <Label htmlFor="catatan_request" className="text-[#8B7D3F]">
                  Catatan Request
                </Label>
                <Textarea
                    id="catatan_request"
                    name="catatan_request"
                    value={orderDetails.catatan_request}
                    onChange={handleOrderChange}
                    placeholder="Masukkan detail permintaan khusus untuk kue..."
                    rows={4}
                    className="bg-[#FAF3E0] text-[#8B7D3F] border-[#C5B358]"
                />
              </div>

              {/* Harga Dasar dan Total */}
              <div className="space-y-2 border-t border-[#D4AF37] pt-4">
                {hargaDasar > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-[#8B7D3F]">Harga Dasar:</span>
                      <span className="font-semibold text-[#8B7D3F]">
                Rp {hargaDasar.toLocaleString()}
              </span>
                    </div>
                )}
                <div className="flex justify-between text-lg">
                  <span className="text-[#8B7D3F]">Total Harga:</span>
                  <span className="font-semibold text-[#8B7D3F]">
              Rp {totalHarga.toLocaleString()}
            </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                {isCustomCakeOrderVisible && (
                    <Button
                        onClick={handleToggleCustomCakeOrder}
                        className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                      Batal Buat Pesanan
                    </Button>
                )}
                <Button
                    type="submit"
                    className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                  <Plus className="h-4 w-4 mr-2" />
                  Kirim Pesanan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Kue Ready Section */}
        <Card className="bg-[#FFF8E7] border-[#D4AF37] border mb-3 md:mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#8B7D3F]">
              <Cake className="h-5 w-5 text-[#8B7D3F]" />
              Kue Stok
            </CardTitle>
          </CardHeader>

          {/* Kue Ready Toggle Button */}
          <div className="flex justify-start mx-4 mb-2">
            {!isKueReadyVisible && (
                <Button
                    onClick={() => setIsKueReadyVisible(!isKueReadyVisible)}
                    className="mt-1 bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                  <Plus className="h-4 w-4 mr-2" />
                  Lihat Kue Stok
                </Button>
            )}
          </div>

          {/* Kue Ready Content - Collapsible */}
          <CardContent
              className={`transition-all duration-500 ease-in-out ${
                  isKueReadyVisible
                      ? "opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
              }`}>
            <div className="flex justify-between mb-4">
              <Button
                  onClick={() => setIsKueReadyModalOpen(true)}
                  className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kue Stok
              </Button>

              {isKueReadyVisible && (
                  <Button
                      onClick={() => setIsKueReadyVisible(false)}
                      className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                    Tutup
                  </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKueReady.map((kue) => {
                const isSelected = isKueReadySelected(kue.id_kue);
                return (
                    <Card
                        key={kue.id_kue}
                        className={`overflow-hidden bg-[#FAF3E0] border border-[#C5B358] ${
                            isKueReadySelected(kue.id_kue) ? "opacity-50" : ""
                        }`}>
                      <div className="aspect-square relative">
                        {kue.gambar ? (
                            <img
                                src={`${API}/${kue.gambar}`}
                                alt={kue.jenis_kue}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#FFF8E7]">
                              <Cake className="h-12 w-12 text-[#D4AF37]" />
                            </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2 text-[#8B7D3F]">
                          {kue.jenis_kue}
                        </h3>
                        <div className="space-y-2 text-sm text-[#B8A361]">
                          <p>Variasi: {kue.variasi_kue}</p>
                          <p>Ukuran: {kue.ukuran_kue}</p>
                          <p>Aksesoris: {kue.aksesoris_kue || "Tidak ada"}</p>
                          <p className="text-lg font-bold text-[#8B7D3F]">
                            Rp {parseFloat(kue.harga_jual).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                              onClick={() => handleKueSelection(kue)}
                              className="flex-1 bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]"
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
                              className="bg-red-600 hover:bg-red-700 border border-[#C5B358]" disabled={isKueReadySelected(kue.id_kue)}>
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
          <DialogContent className="sm:max-w-[425px] bg-[#FFF8E7] border border-[#D4AF37]">
            <DialogHeader>
              <DialogTitle className="text-[#8B7D3F]">
                Nama yang Akan Ditulis di Kue
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                  placeholder="Masukkan nama yang akan ditulis di kue"
                  value={cakeName}
                  onChange={(e) => setCakeName(e.target.value)}
                  className="bg-[#FAF3E0] text-[#8B7D3F] border-[#C5B358]"
              />
              <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                      setIsNameModalOpen(false);
                      setCakeName("");
                      setSelectedKue(null);
                    }}
                    className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                  Batal
                </Button>
                <Button
                    onClick={handleNameSubmit}
                    className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Other Products Section */}
        {loadingProduk ? (
            <p className="text-[#B8A361]">Loading daftar produk...</p>
        ) : (
            <div className="space-y-8">
              <Card className="bg-[#FFF8E7] border-[#D4AF37] border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#8B7D3F]">
                    <Package className="h-6 w-6 text-[#8B7D3F]" />
                    Produk Lainnya
                  </CardTitle>
                </CardHeader>

                {/* Produk Lainnya Toggle Button */}
                <div className="flex justify-start mx-4 mb-2">
                  {!isProdukVisible && (
                      <Button
                          onClick={() => setIsProdukVisible(!isProdukVisible)}
                          className="mt-1 bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                        <Plus className="h-4 w-4 mr-2" />
                        Lihat Produk
                      </Button>
                  )}
                </div>

                {/* Produk Lainnya Content - Collapsible */}
                <CardContent
                    className={`transition-all duration-500 ease-in-out ${
                        isProdukVisible
                            ? "opacity-100"
                            : "max-h-0 opacity-0 overflow-hidden"
                    }`}>
                  {loadingProduk ? (
                      <p className="text-[#B8A361]">Loading daftar produk...</p>
                  ) : (
                      <div className="space-y-4 md:space-y-8">
                        <div className="flex justify-end">
                          {isProdukVisible && (
                              <Button
                                  onClick={() => setIsProdukVisible(false)}
                                  className="bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358]">
                                Tutup
                              </Button>
                          )}
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-[#B8A361]" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari Produk..."
                                className="pl-10 bg-[#FAF3E0] text-[#8B7D3F] border-[#C5B358]"
                            />
                          </div>
                          <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full p-2 rounded-md bg-[#FAF3E0] text-[#8B7D3F] border border-[#C5B358] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]">
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

                        {/* Produk Grid - Updated for mobile */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                          {filteredProduk.map((produk) => (
                              <Card
                                  key={produk.id_produk}
                                  className="overflow-hidden group bg-[#FAF3E0] border border-[#C5B358]">
                                <div className="aspect-square overflow-hidden">
                                  <img
                                      src={`${API}/${produk.gambar}`}
                                      alt={produk.nama_produk}
                                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                </div>
                                <CardContent className="p-2 sm:p-3 md:p-4">
                                  <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 md:mb-2 text-[#8B7D3F] truncate">
                                    {produk.nama_produk}
                                  </h3>
                                  <p className="text-[#8B7D3F] font-medium text-sm sm:text-base mb-1">
                                    Rp {produk.harga_jual.toLocaleString()}
                                  </p>
                                  <p className="text-[#B8A361] text-xs sm:text-sm mb-2 md:mb-4">
                                    Stok: {produk.jumlah_stok}
                                  </p>
                                  <Button
                                      onClick={() => handleAddProduk(produk)}
                                      className="w-full bg-[#E6BE8A] hover:bg-[#D4AF37] text-[#FAF3E0] border border-[#C5B358] text-xs sm:text-sm py-1 h-auto md:h-10">
                                    <span className="flex items-center">Tambah</span>
                                  </Button>
                                </CardContent>
                              </Card>
                          ))}
                        </div>
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
