import React, { useState, useEffect } from "react";
import axios from "axios";

const TambahKategoriProdukNurCake = ({
  onClose,
  onSuccess,
  isEditMode = false,
  kategoriData = null,
}) => {
  const [namaKategori, setNamaKategori] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && kategoriData) {
      setNamaKategori(kategoriData.nama_kategori);
    }
  }, [isEditMode, kategoriData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaKategori.trim()) {
      setError("Nama kategori tidak boleh kosong.");
      return;
    }

    try {
      if (isEditMode) {
        // Update kategori
        await axios.put(
          `http://localhost:3000/kategori-produk/${kategoriData.id_kategori}`,
          {
            nama_kategori: namaKategori,
          }
        );
        alert("Kategori berhasil diperbarui!");
      } else {
        // Tambah kategori
        await axios.post("http://localhost:3000/kategori-produk", {
          nama_kategori: namaKategori,
        });
        alert("Kategori berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(`Gagal ${isEditMode ? "memperbarui" : "menambahkan"} kategori.`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#2d2d2d] p-6 border border-[#FFD700] rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-[#FFD700]">
          {isEditMode ? "Perbarui Kategori Produk" : "Tambah Kategori Produk"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="namaKategori"
              className="block text-sm font-medium mb-2 text-[#DAA520]">
              Nama Kategori
            </label>
            <input
              type="text"
              id="namaKategori"
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="bg-[#3d3d3d] border border-[#FFD700] text-[#DAA520] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#DAA520]"
              placeholder="Masukkan nama kategori"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded-lg hover:bg-[#4d4d4d] border border-[#FFD700] transition-colors">
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#FFD700] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#DAA520] font-semibold transition-colors">
              {isEditMode ? "Perbarui" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahKategoriProdukNurCake;
