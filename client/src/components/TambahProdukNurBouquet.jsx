import React, { useState, useEffect } from "react";
import axios from "axios";

const TambahProdukNurBouquet = ({ onClose, refreshProdukList }) => {
  const [produk, setProduk] = useState({
    nama: "",
    harga: "",
    jenis: "",
    bahan: [], // Menyimpan bahan yang dipilih
  });
  const [bahanList, setBahanList] = useState([]);
  const [selectedBahan, setSelectedBahan] = useState([]);
  const [loadingBahan, setLoadingBahan] = useState(true);

  useEffect(() => {
    fetchBahanList();
  }, []);

  const fetchBahanList = async () => {
    setLoadingBahan(true);
    try {
      const response = await axios.get("http://localhost:3000/bahan");
      setBahanList(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar bahan:", error);
      alert("Gagal mengambil daftar bahan.");
    } finally {
      setLoadingBahan(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduk({
      ...produk,
      [name]: value,
    });
  };

  const handleBahanChange = (e) => {
    const { value } = e.target;
    setSelectedBahan((prevSelected) => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter((item) => item !== value);
      } else {
        return [...prevSelected, value];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !produk.nama ||
      !produk.harga ||
      !produk.jenis ||
      selectedBahan.length === 0
    ) {
      alert("Harap lengkapi semua field.");
      return;
    }

    try {
      const newProduk = {
        nama: produk.nama,
        harga: produk.harga,
        jenis: produk.jenis,
        bahan: selectedBahan,
      };

      await axios.post("http://localhost:3000/produk", newProduk);
      alert("Produk berhasil ditambahkan!");
      refreshProdukList();
      onClose();
    } catch (error) {
      console.error("Gagal menambah produk:", error);
      alert("Gagal menambah produk.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-[#155E75]">
          Tambah Produk
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nama Produk</label>
            <input
              type="text"
              name="nama"
              value={produk.nama}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Nama produk"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Harga</label>
            <input
              type="number"
              name="harga"
              value={produk.harga}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Harga produk"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Jenis Produk</label>
            <select
              name="jenis"
              value={produk.jenis}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md">
              <option value="">Pilih jenis produk</option>
              <option value="Buket Bunga">Buket Bunga</option>
              <option value="Karangan Bunga">Karangan Bunga</option>
              <option value="Paket Bunga">Paket Bunga</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Pilih Bahan</label>
            {loadingBahan ? (
              <p>Loading bahan...</p>
            ) : (
              <div className="space-y-2">
                {bahanList.map((bahan) => (
                  <div key={bahan.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={bahan.id}
                      value={bahan.id}
                      checked={selectedBahan.includes(bahan.id)}
                      onChange={handleBahanChange}
                      className="mr-2"
                    />
                    <label htmlFor={bahan.id} className="text-gray-700">
                      {bahan.nama} (Stok: {bahan.stok})
                    </label>
                  </div>
                ))}
              </div>
            )}
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
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahProdukNurBouquet;
