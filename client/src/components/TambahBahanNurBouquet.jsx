import React, { useState } from "react";
import axios from "axios";

const TambahBahanNurBouquet = ({ onClose, refreshBahanList }) => {
  const [bahan, setBahan] = useState({
    nama: "",
    stok: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBahan({
      ...bahan,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bahan.nama || !bahan.stok) {
      alert("Harap lengkapi semua field.");
      return;
    }

    try {
      const newBahan = {
        nama: bahan.nama,
        stok: bahan.stok,
      };

      await axios.post("http://localhost:3000/bahan", newBahan);
      alert("Bahan berhasil ditambahkan!");
      refreshBahanList();
      onClose();
    } catch (error) {
      console.error("Gagal menambah bahan:", error);
      alert("Gagal menambah bahan.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-[#155E75]">
          Tambah Bahan
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nama Bahan</label>
            <input
              type="text"
              name="nama"
              value={bahan.nama}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nama bahan"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Stok Bahan</label>
            <input
              type="number"
              name="stok"
              value={bahan.stok}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Stok bahan"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Tutup
            </button>
            <button
              type="submit"
              className="bg-[#0c647a] text-white px-6 py-2 rounded-md hover:bg-[#0a5c66]">
              Simpan Bahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahBahanNurBouquet;
