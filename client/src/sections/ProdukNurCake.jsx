import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahProdukNurCake from "../components/TambahProdukNurCake";
import TambahKategoriProdukNurCake from "../components/TambahKategoriProdukNurCake";
import { Link } from "react-router-dom";

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
      const response = await axios.get("http://localhost:3000/kategori-produk");
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
      const response = await axios.get("http://localhost:3000/produkNC");
      setProdukList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar produk:", error);
      alert("Gagal mengambil daftar produk.");
    } finally {
      setLoadingProduk(false);
    }
  };

  // Di ProdukNurCake.jsx
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
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(
          `http://localhost:3000/kategori-produk/${id_kategori}`
        );
        alert("Produk berhasil dihapus.");
        fetchKategoriList();
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk.");
      }
    }
  };

  // Add handleDeleteProduk function
  const handleDeleteProduk = async (id_produk) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`http://localhost:3000/produkNC/${id_produk}`);
        alert("Produk berhasil dihapus.");
        fetchProdukList(); // Refresh the list after deletion
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk.");
      }
    }
  };

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
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
        Daftar Produk dan Kategori
      </h1>
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <button
          onClick={() => setShowAddProduk(true)}
          className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded-2xl shadow-md hover:bg-[#2d2d2d] transition duration-300 border border-[#FFD700]">
          Tambah Produk
        </button>
        <button
          onClick={() => setShowAddKategori(true)}
          className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded-2xl shadow-md hover:bg-[#2d2d2d] transition duration-300 border border-[#FFD700]">
          Tambah Kategori
        </button>
        <button className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded-2xl shadow-md hover:bg-[#2d2d2d] transition duration-300 border border-[#FFD700]">
          <Link to="/harga-kue">Harga Kue</Link>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-[#FFD700] bg-[#2d2d2d] text-[#DAA520] px-4 py-2 w-full rounded placeholder-[#DAA520]"
        />
      </div>

      {/* Tabel Produk */}
      {loadingProduk ? (
        <p className="text-[#DAA520]">Loading daftar produk...</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <h2 className="text-[30px] font-semibold mb-5 text-[#FFD700] font-Roboto">
            Daftar Produk
          </h2>
          <table className="min-w-full bg-[#2d2d2d] shadow-md rounded-lg overflow-hidden border border-[#FFD700]">
            <thead className="bg-[#3d3d3d] text-[#FFD700] border-[#FFD700] border-b">
              <tr>
                <th className="px-4 py-2 border-b border-[#FFD700]">ID</th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Nama Produk
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Kategori
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Modal Produk
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Harga Produk
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Jumlah Stok
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">Gambar</th>
                <th className="px-4 py-2 border-b border-[#FFD700] min-w-[150px] w-[150px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-[#DAA520]">
              {produkList.map((produk) => (
                <tr key={produk.id_produk} className="hover:bg-[#3d3d3d]">
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.id_produk}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.nama_produk}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.nama_kategori}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.modal_produk}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.harga_jual}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.jumlah_stok}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {produk.gambar ? (
                      <div>
                        <img
                          src={`http://localhost:3000/${produk.gambar}`}
                          alt="Produk"
                          className="w-20 h-20 object-cover cursor-pointer rounded-lg hover:opacity-80 transition-opacity"
                          onClick={() =>
                            setSelectedImage(
                              `http://localhost:3000/${produk.gambar}`
                            )
                          }
                        />
                      </div>
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700] min-w-[150px] w-[150px]">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditProduk(produk)}
                        className="bg-[#DAA520] text-white px-3 py-1 rounded hover:bg-[#FFD700] w-20">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduk(produk.id_produk)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-20">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabel Kategori */}
      {loadingKategori ? (
        <p className="text-[#DAA520]">Loading daftar kategori...</p>
      ) : (
        <div className="overflow-x-auto">
          <h2 className="text-[30px] font-semibold mb-5 text-[#FFD700] font-Roboto">
            Daftar Kategori
          </h2>
          <table className="min-w-full bg-[#2d2d2d] shadow-md rounded-lg overflow-hidden border border-[#FFD700]">
            <thead className="bg-[#3d3d3d] text-[#FFD700] border-[#FFD700] border-b">
              <tr>
                <th className="px-4 py-2 border-b border-[#FFD700]">ID</th>
                <th className="px-4 py-2 border-b border-[#FFD700]">
                  Nama Kategori
                </th>
                <th className="px-4 py-2 border-b border-[#FFD700]">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-[#DAA520]">
              {kategoriList.map((kategori) => (
                <tr key={kategori.id_kategori} className="hover:bg-[#3d3d3d]">
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {kategori.id_kategori}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700]">
                    {kategori.nama_kategori}
                  </td>
                  <td className="px-4 py-2 border-b border-[#FFD700] flex space-x-2">
                    <button
                      onClick={() => handleEditKategori(kategori)}
                      className="bg-[#DAA520] text-white px-3 py-1 rounded hover:bg-[#FFD700]">
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteKatProduk(kategori.id_kategori)
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        />
      )}
    </section>
  );
};

export default ProdukNurCake;
