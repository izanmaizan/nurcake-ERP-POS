import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahProdukNurCake from "../components/TambahProdukNurCake";
import TambahKategoriProdukNurCake from "../components/TambahKategoriProdukNurCake";
import { Link } from "react-router-dom";

// Warna tema krem/emas
const COLORS = {
  primary: "#D4AF37", // Emas utama
  secondary: "#C5B358", // Emas sekunder
  accent: "#E6BE8A", // Emas muda/aksen
  bgColor: "#FAF3E0", // Krem muda/background utama
  textColor: "#8B7D3F", // Emas gelap untuk teks
  secondaryTextColor: "#B8A361", // Emas sedang untuk teks sekunder
  cardBgColor: "#FFF8E7" // Krem sangat muda untuk kartu
};

// API endpoint
const API = import.meta.env.VITE_API;

const ProdukNurCake = () => {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [showAddProduk, setShowAddProduk] = useState(false);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [loadingProduk, setLoadingProduk] = useState(true);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [editKategoriData, setEditKategoriData] = useState(null);
  const [editProdukData, setEditProdukData] = useState(null);

  useEffect(() => {
    fetchProdukList();
    fetchKategoriList();
  }, []);

  const fetchKategoriList = async () => {
    setLoadingKategori(true);
    try {
      const response = await axios.get(`${API}/kategori-produk`);
      setKategoriList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar kategori:", error);
      alert("Gagal mengambil daftar kategori.");
    } finally {
      setLoadingKategori(false);
    }
  };

  const handleEditKategori = (kategori) => {
    setEditKategoriData(kategori);
    setShowAddKategori(true);
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

  const handleEditProduk = (produk) => {
    // Pastikan semua data yang diperlukan tersedia
    const produkData = {
      id_produk: produk.id_produk,
      nama_produk: produk.nama_produk,
      id_kategori: produk.id_kategori,
      modal_produk: produk.modal_produk,
      harga_jual: produk.harga_jual,
      jumlah_stok: produk.jumlah_stok,
      gambar: produk.gambar,
    };
    setEditProdukData(produkData);
    setShowAddProduk(true);
  };

  const handleDeleteKatProduk = async (id_kategori) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await axios.delete(`${API}/kategori-produk/${id_kategori}`);
        alert("Kategori berhasil dihapus.");
        fetchKategoriList();
      } catch (error) {
        console.error("Gagal menghapus kategori:", error);
        alert("Gagal menghapus kategori.");
      }
    }
  };

  const handleDeleteProduk = async (id_produk) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`${API}/produkNC/${id_produk}`);
        alert("Produk berhasil dihapus.");
        fetchProdukList(); // Refresh the list after deletion
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk.");
      }
    }
  };

  const filteredProdukList = produkList.filter(produk =>
      produk.nama_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ImageModal = ({ imageUrl, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}>
          <div className="relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200">
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
                    d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
                src={imageUrl}
                alt="Full size product"
                className="max-h-[90vh] max-w-[90vw] object-contain"
                onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
    );
  };

  return (
      <section className="bg-[#FAF3E0] py-8 px-4 h-full w-full md:py-16 md:px-8 lg:px-16 transition-all duration-300 mt-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 text-[#8B7D3F] font-Roboto">
          Daftar Produk dan Kategori
        </h1>

        <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
          <button
              onClick={() => setShowAddProduk(true)}
              className="bg-[#FFF8E7] text-[#8B7D3F] px-4 py-2 rounded-xl shadow-md hover:bg-[#D4AF37] hover:text-white transition duration-300 border border-[#C5B358]">
            Tambah Produk
          </button>
          <button
              onClick={() => setShowAddKategori(true)}
              className="bg-[#FFF8E7] text-[#8B7D3F] px-4 py-2 rounded-xl shadow-md hover:bg-[#D4AF37] hover:text-white transition duration-300 border border-[#C5B358]">
            Tambah Kategori
          </button>
          <button className="bg-[#FFF8E7] text-[#8B7D3F] px-4 py-2 rounded-xl shadow-md hover:bg-[#D4AF37] hover:text-white transition duration-300 border border-[#C5B358]">
            <Link to="/harga-kue">Harga Kue</Link>
          </button>
        </div>

        <div className="mb-6">
          <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-[#C5B358] bg-[#FFF8E7] text-[#8B7D3F] px-4 py-2 w-full rounded-lg placeholder-[#B8A361] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Tabel Produk */}
        {loadingProduk ? (
            <div className="flex justify-center my-8">
              <p className="text-[#8B7D3F] text-lg">Loading daftar produk...</p>
            </div>
        ) : (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#8B7D3F] font-Roboto">
                Daftar Produk
              </h2>
              <div className="overflow-x-auto bg-[#FFF8E7] rounded-lg shadow-md">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#E6BE8A] text-[#8B7D3F]">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">ID</th>
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Nama Produk</th>
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Kategori</th>
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Modal Produk</th>
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Harga Produk</th>
                    {/*<th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Jumlah Stok</th>*/}
                    <th className="px-3 py-3 text-left text-sm font-medium md:px-4 md:py-3 md:text-base">Gambar</th>
                    <th className="px-3 py-3 text-center text-sm font-medium md:px-4 md:py-3 md:text-base min-w-[120px]">Aksi</th>
                  </tr>
                  </thead>
                  <tbody className="text-[#8B7D3F] divide-y divide-[#E6BE8A]">
                  {filteredProdukList.length > 0 ? (
                      filteredProdukList.map((produk) => (
                          <tr key={produk.id_produk} className="hover:bg-[#F5ECD6] transition-colors">
                            <td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">
                              {produk.id_produk}
                            </td>
                            <td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">
                              {produk.nama_produk}
                            </td>
                            <td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">
                              {produk.nama_kategori}
                            </td>
                            <td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">
                              {produk.modal_produk}
                            </td>
                            <td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">
                              {produk.harga_jual}
                            </td>
                            {/*<td className="px-3 py-3 text-sm md:px-4 md:py-3 md:text-base">*/}
                            {/*  {produk.jumlah_stok}*/}
                            {/*</td>*/}
                            <td className="px-3 py-3 md:px-4 md:py-3">
                              {produk.gambar ? (
                                  <div>
                                    <img
                                        src={`${API}/${produk.gambar}`}
                                        alt="Produk"
                                        className="w-16 h-16 md:w-20 md:h-20 object-cover cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
                                        onClick={() =>
                                            setSelectedImage(`${API}/${produk.gambar}`)
                                        }
                                    />
                                  </div>
                              ) : (
                                  <span className="text-sm md:text-base text-gray-500">No Image</span>
                              )}
                            </td>
                            <td className="px-2 py-3 md:px-4">
                              <div className="flex flex-col sm:flex-row justify-center gap-2">
                                <button
                                    onClick={() => handleEditProduk(produk)}
                                    className="bg-[#D4AF37] text-white px-3 py-1 rounded-md hover:bg-[#C5B358] transition-colors text-sm md:text-base">
                                  Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProduk(produk.id_produk)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm md:text-base">
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                          {searchQuery ? "Tidak ada produk yang sesuai dengan pencarian" : "Tidak ada produk"}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Tabel Kategori */}
        {loadingKategori ? (
            <div className="flex justify-center my-8">
              <p className="text-[#8B7D3F] text-lg">Loading daftar kategori...</p>
            </div>
        ) : (
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#8B7D3F] font-Roboto">
                Daftar Kategori
              </h2>
              <div className="overflow-x-auto bg-[#FFF8E7] rounded-lg shadow-md">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#E6BE8A] text-[#8B7D3F]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium md:text-base">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium md:text-base">Nama Kategori</th>
                    <th className="px-4 py-3 text-center text-sm font-medium md:text-base">Aksi</th>
                  </tr>
                  </thead>
                  <tbody className="text-[#8B7D3F] divide-y divide-[#E6BE8A]">
                  {kategoriList.length > 0 ? (
                      kategoriList.map((kategori) => (
                          <tr key={kategori.id_kategori} className="hover:bg-[#F5ECD6] transition-colors">
                            <td className="px-4 py-3 text-sm md:text-base">
                              {kategori.id_kategori}
                            </td>
                            <td className="px-4 py-3 text-sm md:text-base">
                              {kategori.nama_kategori}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                                <button
                                    onClick={() => handleEditKategori(kategori)}
                                    className="bg-[#D4AF37] text-white px-3 py-1 rounded-md hover:bg-[#C5B358] transition-colors text-sm md:text-base w-20">
                                  Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteKatProduk(kategori.id_kategori)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm md:text-base w-20">
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                          Tidak ada kategori
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
            <ImageModal
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        )}

        {/* Other Modals */}
        {showAddProduk && (
            <TambahProdukNurCake
                onClose={() => {
                  setShowAddProduk(false);
                  setEditProdukData(null);
                }}
                onSuccess={fetchProdukList}
                produk={editProdukData}
                colors={COLORS}
                api={API}
            />
        )}

        {showAddKategori && (
            <TambahKategoriProdukNurCake
                onClose={() => {
                  setShowAddKategori(false);
                  setEditKategoriData(null);
                }}
                onSuccess={fetchKategoriList}
                isEditMode={!!editKategoriData}
                kategoriData={editKategoriData}
                colors={COLORS}
                api={API}
            />
        )}
      </section>
  );
};

export default ProdukNurCake;