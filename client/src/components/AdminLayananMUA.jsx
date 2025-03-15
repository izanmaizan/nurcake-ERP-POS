import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminLayananMUA = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paketLayanan, setPaketLayanan] = useState([]);
  const [formData, setFormData] = useState({
    nama_paket: "",
    harga: "",
    kisaran_modal: "",
    kategori: "",
    layanan: [],
    gambar: null,
  });
  const [currentLayananId, setCurrentLayananId] = useState(null);
  const [newLayananItem, setNewLayananItem] = useState("");

  useEffect(() => {
    fetchLayanan();
  }, []);

  // Di useEffect saat fetchLayanan
  const fetchLayanan = async () => {
    try {
      const response = await axios.get("http://localhost:3000/layanan");
      const parsedData = response.data.map((item) => ({
        ...item,
        // Cek jika layanan sudah dalam bentuk array
        layanan: Array.isArray(item.layanan)
          ? item.layanan
          : typeof item.layanan === "string"
            ? tryParseJSON(item.layanan) || []
            : [],
      }));
      setPaketLayanan(parsedData);
    } catch (error) {
      console.error("Error fetching layanan:", error);
      alert("Gagal mengambil data layanan");
    }
  };

  const tryParseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Error parsing JSON:", error);
      return null;
    }
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      gambar: e.target.files[0],
    });
  };

  const handleAddLayananItem = () => {
    if (newLayananItem.trim()) {
      setFormData({
        ...formData,
        layanan: [...formData.layanan, newLayananItem.trim()],
      });
      setNewLayananItem("");
    }
  };

  const handleRemoveLayananItem = (index) => {
    setFormData({
      ...formData,
      layanan: formData.layanan.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("nama_paket", formData.nama_paket);
    formDataObj.append("kategori", formData.kategori);
    formDataObj.append("harga", formData.harga);
    // Pastikan layanan adalah array sebelum dikonversi ke JSON
    formDataObj.append(
      "layanan",
      JSON.stringify(Array.isArray(formData.layanan) ? formData.layanan : [])
    );
    if (formData.gambar) {
      formDataObj.append("gambar", formData.gambar);
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:3000/layanan/${currentLayananId}`,
          formDataObj,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        alert("Layanan berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:3000/layanan", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Layanan berhasil ditambahkan!");
      }
      fetchLayanan();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert(
        isEditing ? "Gagal memperbarui layanan" : "Gagal menambahkan layanan"
      );
    }
  };

  const handleEdit = (paket) => {
    setFormData({
      nama_paket: paket.nama_paket,
      harga: paket.harga,
      kategori: paket.kategori,
      layanan: paket.layanan,
      gambar: null,
    });
    setCurrentLayananId(paket.id_layanan);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      try {
        await axios.delete(`http://localhost:3000/layanan/${id}`);
        alert("Layanan berhasil dihapus!");
        fetchLayanan();
      } catch (error) {
        console.error("Error:", error);
        alert("Gagal menghapus layanan");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nama_paket: "",
      harga: "",
      kategori: "",
      layanan: [],
      gambar: null,
    });
    setIsEditing(false);
    setShowForm(false);
    setCurrentLayananId(null);
    setNewLayananItem("");
  };

  return (
    // Admin Layanan MUA
    <section className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#FFD700]">
          Kelola Paket Layanan MUA
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FFD700] text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#DAA520] transition-colors">
          {showForm ? "Tutup Form" : "Tambah Layanan"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#2d2d2d] p-6 rounded-xl shadow-lg mb-8 border border-[#FFD700]">
          <h3 className="text-xl font-bold text-[#FFD700] mb-4">
            {isEditing ? "Edit Layanan" : "Tambah Layanan Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Nama Paket
              </label>
              <input
                type="text"
                value={formData.nama_paket}
                onChange={(e) =>
                  setFormData({ ...formData, nama_paket: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700]"
                required
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Kategori
              </label>
              <select
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700]"
                required>
                <option value="">Pilih Kategori</option>
                <option value="Wedding">Wedding</option>
                <option value="PreWedding">PreWedding</option>
                <option value="Engagement">Engagement</option>
                <option value="Party">Party</option>
                <option value="Special">Special</option>
              </select>
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Kisaran Modal
              </label>
              <input
                type="number"
                value={formData.kisaran_modal}
                onChange={(e) =>
                  setFormData({ ...formData, kisaran_modal: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700]"
                required
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Harga
              </label>
              <input
                type="number"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700]"
                required
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Gambar
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full text-[#DAA520]"
                accept="image/*"
              />
            </div>

            <div>
              <label className="block text-[#DAA520] font-semibold mb-2">
                Layanan
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newLayananItem}
                  onChange={(e) => setNewLayananItem(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#FFD700] bg-[#3d3d3d] text-white focus:ring-2 focus:ring-[#FFD700]"
                  placeholder="Tambah item layanan"
                />
                <button
                  type="button"
                  onClick={handleAddLayananItem}
                  className="bg-[#FFD700] text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#DAA520]">
                  Tambah
                </button>
              </div>
              <div className="space-y-2">
                {formData.layanan.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#3d3d3d] p-2 rounded border border-[#FFD700]">
                    <span className="text-white">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLayananItem(index)}
                      className="text-red-400 hover:text-red-300">
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-[#FFD700] text-[#1a1a1a] px-6 py-2 rounded-lg hover:bg-[#DAA520] transition-colors">
                {isEditing ? "Perbarui" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paketLayanan.map((paket) => (
          <div
            key={paket.id_layanan}
            className="bg-[#2d2d2d] rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-[#FFD700]">
            <div className="relative">
              <img
                src={`http://localhost:3000/${paket.gambar}`}
                alt={paket.nama_paket}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#FFD700] text-[#1a1a1a] px-3 py-1 rounded-full">
                {paket.kategori}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#FFD700] mb-2">
                  {paket.nama_paket}
                </h3>
                <p className="text-[#DAA520] font-semibold mb-2">
                  Modal: Rp. {paket.kisaran_modal}
                </p>
                <p className="text-[#DAA520] font-semibold mb-4">
                  Rp. {paket.harga}
                </p>
                <div className="space-y-2">
                  {Array.isArray(paket.layanan) ? (
                    paket.layanan.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <svg
                          className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-[#DAA520] text-sm">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#DAA520]">Tidak ada layanan tersedia</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => handleEdit(paket)}
                  className="flex-1 bg-[#DAA520] text-white px-4 py-2 rounded-lg hover:bg-[#FFD700] hover:text-[#1a1a1a] transition-colors">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(paket.id_layanan)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminLayananMUA;
