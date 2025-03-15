import React, { useState, useEffect } from "react";
import axios from "axios";

const TambahEditProdukModalNBA = ({
  isOpen,
  onClose,
  produkData = null,
  refreshProdukList,
}) => {
  const initialFormData = {
    nama_produk: "",
    kategori: "",
    harga: "",
    modal_pembuatan: "", // Tambah field modal_pembuatan
    deskripsi: "",
    stok: "",
    status: "Tersedia",
    foto_produk: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const KATEGORI_OPTIONS = [
    "Buket Bunga Artificial",
    "Buket Uang",
    "Buket Kupu-kupu",
    "Buket Foto",
    "Buket Snack",
    "Money Cake",
    "Snack Cake",
  ];

  useEffect(() => {
    if (produkData) {
      setFormData({
        nama_produk: produkData.nama_produk,
        kategori: produkData.kategori,
        harga: produkData.harga,
        modal_pembuatan: produkData.modal_pembuatan, // Tambah field modal_pembuatan
        deskripsi: produkData.deskripsi || "",
        stok: produkData.stok,
        status: produkData.status,
      });
      if (produkData.foto_produk) {
        setPreviewImage(`http://localhost:3000/${produkData.foto_produk}`);
      }
    } else {
      setFormData(initialFormData);
      setPreviewImage(null);
    }
  }, [produkData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto_produk: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "foto_produk" && formData[key] instanceof File) {
          formDataToSend.append("foto_produk", formData[key]);
        } else if (key !== "foto_produk") {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (produkData) {
        await axios.put(
          `http://localhost:3000/produkNBA/${produkData.id_produk}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Produk berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:3000/produkNBA", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Produk berhasil ditambahkan!");
      }

      refreshProdukList();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2d2d2d] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#FFD700]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#FFD700] font-Roboto">
            {produkData ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                name="nama_produk"
                value={formData.nama_produk}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Kategori
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]">
                <option value="">Pilih Kategori</option>
                {KATEGORI_OPTIONS.map((kategori) => (
                  <option key={kategori} value={kategori}>
                    {kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Harga
              </label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            {/* Tambah field Modal Pembuatan */}
            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Modal Pembuatan
              </label>
              <input
                type="number"
                name="modal_pembuatan"
                value={formData.modal_pembuatan}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Stok
              </label>
              <input
                type="number"
                name="stok"
                value={formData.stok}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]">
                <option value="Tersedia">Tersedia</option>
                <option value="Tidak Tersedia">Tidak Tersedia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DAA520] mb-1">
                Foto Produk
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded border-[#FFD700] bg-[#3d3d3d] text-[#DAA520] focus:ring-2 focus:ring-[#FFD700]"
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-2 h-32 object-cover rounded border border-[#FFD700]"
                />
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#FFD700] text-[#DAA520] rounded hover:bg-[#1a1a1a] transition duration-300"
                disabled={loading}>
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3d3d3d] text-[#FFD700] rounded border border-[#FFD700] hover:bg-[#1a1a1a] transition duration-300"
                disabled={loading}>
                {loading
                  ? "Menyimpan..."
                  : produkData
                    ? "Simpan Perubahan"
                    : "Tambah Produk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahEditProdukModalNBA;
