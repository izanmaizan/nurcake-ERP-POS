import React, { useState, useEffect } from "react";
import axios from "axios";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
// Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

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
            `${API}/kategori-produk/${kategoriData.id_kategori}`,
            {
              nama_kategori: namaKategori,
            }
        );
        alert("Kategori berhasil diperbarui!");
      } else {
        // Tambah kategori
        await axios.post(`${API}/kategori-produk`, {
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
        <div className="bg-[#FFF8E7] p-4 md:p-6 border border-[#D4AF37] rounded-lg shadow-lg w-11/12 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:max-w-md">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-[#8B7D3F]">
            {isEditMode ? "Perbarui Kategori Produk" : "Tambah Kategori Produk"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                  htmlFor="namaKategori"
                  className="block text-sm font-medium mb-2 text-[#B8A361]"
              >
                Nama Kategori
              </label>
              <input
                  type="text"
                  id="namaKategori"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  className="bg-[#FAF3E0] border border-[#C5B358] text-[#8B7D3F] px-3 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Masukkan nama kategori"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3 md:space-x-4">
              <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#FAF3E0] text-[#B8A361] px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#FFF8E7] border border-[#C5B358] transition-colors text-sm md:text-base"
              >
                Batal
              </button>
              <button
                  type="submit"
                  className="bg-[#D4AF37] text-[#FFF8E7] px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-[#C5B358] font-semibold transition-colors text-sm md:text-base"
              >
                {isEditMode ? "Perbarui" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default TambahKategoriProdukNurCake;