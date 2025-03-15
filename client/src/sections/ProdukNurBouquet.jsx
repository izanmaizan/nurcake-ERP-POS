import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahEditProdukModal from "../components/TambahEditProdukModalNBA.jsx";

const ProdukNurBouquet = () => {
  const [produkList, setProdukList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProdukList();
  }, []);

  const fetchProdukList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/produkNBA");
      setProdukList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar produk:", error);
      alert("Gagal mengambil daftar produk.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduk = (produk) => {
    setSelectedProduk(produk);
    setShowModal(true);
  };

  const handleAddProduk = () => {
    setSelectedProduk(null);
    setShowModal(true);
  };

  const handleDeleteProduk = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`http://localhost:3000/produkNBA/${id}`);
        alert("Produk berhasil dihapus.");
        fetchProdukList();
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduk(null);
  };

  const handleStatusChange = async (produk, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/produkNBA/${produk.id_produk}`, {
        ...produk,
        status: newStatus,
      });
      fetchProdukList();
    } catch (error) {
      console.error("Gagal mengubah status produk:", error);
      alert("Gagal mengubah status produk.");
    }
  };

  const filteredProdukList = produkList.filter(
    (produk) =>
      produk.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produk.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Produk Nur Bouquet
    <div className="min-h-screen bg-[#1a1a1a]">
      <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
        <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
          Manajemen Produk Nur Bouquet Aest
        </h1>

        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={handleAddProduk}
            className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded-2xl shadow-md hover:bg-[#2d2d2d] transition duration-300">
            Tambah Produk
          </button>

          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#FFD700] bg-[#2d2d2d] text-[#DAA520] px-4 py-2 w-64 rounded placeholder-[#DAA520]"
          />
        </div>

        {loading ? (
          <p className="text-[#DAA520]">Loading daftar produk...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#2d2d2d] shadow-md rounded-lg overflow-hidden border border-[#FFD700]">
              <thead className="bg-[#3d3d3d]">
                <tr>
                  <th className="px-4 py-2 text-[#FFD700]">Foto</th>
                  <th className="px-4 py-2 text-[#FFD700]">Nama Produk</th>
                  <th className="px-4 py-2 text-[#FFD700]">Kategori</th>
                  <th className="px-4 py-2 text-[#FFD700]">Harga</th>
                  <th className="px-4 py-2 text-[#FFD700]">Modal Pembuatan</th>
                  <th className="px-4 py-2 text-[#FFD700]">Stok</th>
                  <th className="px-4 py-2 text-[#FFD700]">Status</th>
                  <th className="px-4 py-2 text-[#FFD700]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdukList.map((produk) => (
                  <tr
                    key={produk.id_produk}
                    className="hover:bg-[#1a1a1a] text-[#DAA520]">
                    <td className="px-4 py-2">
                      {produk.foto_produk && (
                        <img
                          src={`http://localhost:3000/${produk.foto_produk}`}
                          alt={produk.nama_produk}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">{produk.nama_produk}</td>
                    <td className="px-4 py-2">{produk.kategori}</td>
                    <td className="px-4 py-2">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(produk.harga)}
                    </td>
                    <td className="px-4 py-2">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(produk.modal_pembuatan)}
                    </td>
                    <td className="px-4 py-2">{produk.stok}</td>
                    <td className="px-4 py-2">
                      <select
                        value={produk.status}
                        onChange={(e) =>
                          handleStatusChange(produk, e.target.value)
                        }
                        className={`px-3 py-1 rounded cursor-pointer border ${
                          produk.status === "Tersedia"
                            ? "bg-[#2d2d2d] text-[#FFD700] border-[#FFD700]"
                            : "bg-[#2d2d2d] text-red-500 border-red-500"
                        }`}>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Tidak Tersedia">Tidak Tersedia</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduk(produk)}
                          className="bg-[#3d3d3d] text-[#FFD700] px-3 py-1 rounded hover:bg-[#2d2d2d] border border-[#FFD700]">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduk(produk.id_produk)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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
        {/* Modal Tambah/Edit Produk */}
        <TambahEditProdukModal
          isOpen={showModal}
          onClose={handleCloseModal}
          produkData={selectedProduk}
          refreshProdukList={fetchProdukList}
        />
      </section>
    </div>
  );
};

export default ProdukNurBouquet;
