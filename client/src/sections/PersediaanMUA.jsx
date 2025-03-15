import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const PersediaanMUA = () => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({
    nama_item: "",
    kategori: "",
    merek: "",
    jumlah: 0,
    satuan: "",
    minimal_stok: 1,
    tanggal_beli: "",
    tanggal_kadaluarsa: "",
    harga_beli: "",
    status: "Tersedia",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all items when component mounts
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/persediaan");
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data persediaan");
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/persediaan",
        newItem
      );
      setInventory([...inventory, response.data.data]);
      setNewItem({
        nama_item: "",
        kategori: "",
        merek: "",
        jumlah: 0,
        satuan: "",
        minimal_stok: 1,
        tanggal_beli: "",
        tanggal_kadaluarsa: "",
        harga_beli: "",
        status: "Tersedia",
      });
      setError(null);
    } catch (err) {
      setError("Gagal menambahkan item");
      console.error("Error adding item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id_item, status) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/persediaan/${id_item}/status`, {
        status,
      });
      setInventory(
        inventory.map((item) =>
          item.id_item === id_item
            ? { ...item, status, updated_at: new Date().toISOString() }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError("Gagal mengubah status");
      console.error("Error updating status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id_item) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        setLoading(true);
        await axios.delete(`/api/persediaan/${id_item}`);
        setInventory(inventory.filter((item) => item.id_item !== id_item));
        setError(null);
      } catch (err) {
        setError("Gagal menghapus item");
        console.error("Error deleting item:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    // PersediaanMUA
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <h1 className="text-4xl font-bold text-[#FFD700] mb-8">
        Manajemen Persediaan MUA
      </h1>

      {error && (
        <div className="bg-[#3d3d3d] border border-red-400 text-red-400 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Form Tambah Item */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-[#FFD700] mb-4">
          Tambah Item Baru
        </h2>
        <form
          onSubmit={handleAddItem}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="nama_item"
            value={newItem.nama_item}
            onChange={handleInputChange}
            placeholder="Nama Item"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
            required
          />
          <input
            type="text"
            name="kategori"
            value={newItem.kategori}
            onChange={handleInputChange}
            placeholder="Kategori"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
            required
          />
          <input
            type="text"
            name="merek"
            value={newItem.merek}
            onChange={handleInputChange}
            placeholder="Merek"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
          />
          <input
            type="number"
            name="jumlah"
            value={newItem.jumlah}
            onChange={handleInputChange}
            placeholder="Jumlah"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
            required
          />
          <input
            type="text"
            name="satuan"
            value={newItem.satuan}
            onChange={handleInputChange}
            placeholder="Satuan"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
          />
          <input
            type="number"
            name="minimal_stok"
            value={newItem.minimal_stok}
            onChange={handleInputChange}
            placeholder="Minimal Stok"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
          />
          <input
            type="date"
            name="tanggal_beli"
            value={newItem.tanggal_beli}
            onChange={handleInputChange}
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520]"
          />
          <input
            type="date"
            name="tanggal_kadaluarsa"
            value={newItem.tanggal_kadaluarsa}
            onChange={handleInputChange}
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520]"
          />
          <input
            type="number"
            name="harga_beli"
            value={newItem.harga_beli}
            onChange={handleInputChange}
            placeholder="Harga Beli"
            step="0.01"
            className="p-3 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520] placeholder-[#8B7355]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FFD700] text-[#1a1a1a] py-3 px-6 rounded-md col-span-full md:col-span-1 disabled:opacity-50 hover:bg-[#DAA520] transition-colors">
            {loading ? "Menambahkan..." : "Tambah Item"}
          </button>
        </form>
      </div>

      {/* Tabel Persediaan */}
      <div className="bg-[#2d2d2d] p-6 rounded shadow-md overflow-x-auto border border-[#FFD700]">
        <h2 className="text-xl font-semibold text-[#FFD700] mb-4">
          Daftar Persediaan
        </h2>
        {loading && (
          <div className="text-center py-4 text-[#DAA520]">Memuat data...</div>
        )}
        <table className="min-w-full table-auto">
          <thead className="bg-[#3d3d3d]">
            <tr>
              <th className="py-2 px-4 text-left text-[#FFD700]">Nama Item</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Kategori</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Merek</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Jumlah</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Satuan</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">
                Minimal Stok
              </th>
              <th className="py-2 px-4 text-left text-[#FFD700]">
                Tanggal Beli
              </th>
              <th className="py-2 px-4 text-left text-[#FFD700]">
                Tanggal Kadaluarsa
              </th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Harga Beli</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Status</th>
              <th className="py-2 px-4 text-left text-[#FFD700]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr
                key={item.id_item}
                className="hover:bg-[#3d3d3d] border-t border-[#FFD700]">
                <td className="py-2 px-4 text-[#DAA520]">{item.nama_item}</td>
                <td className="py-2 px-4 text-[#DAA520]">{item.kategori}</td>
                <td className="py-2 px-4 text-[#DAA520]">{item.merek}</td>
                <td className="py-2 px-4 text-[#DAA520]">{item.jumlah}</td>
                <td className="py-2 px-4 text-[#DAA520]">{item.satuan}</td>
                <td className="py-2 px-4 text-[#DAA520]">
                  {item.minimal_stok}
                </td>
                <td className="py-2 px-4 text-[#DAA520]">
                  {item.tanggal_beli}
                </td>
                <td className="py-2 px-4 text-[#DAA520]">
                  {item.tanggal_kadaluarsa}
                </td>
                <td className="py-2 px-4 text-[#DAA520]">
                  {item.harga_beli?.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id_item, e.target.value)
                    }
                    disabled={loading}
                    className="p-2 bg-[#2d2d2d] border border-[#FFD700] rounded-md text-[#DAA520]">
                    <option value="Tersedia">Tersedia</option>
                    <option value="Hampir Habis">Hampir Habis</option>
                    <option value="Habis">Habis</option>
                  </select>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleDeleteItem(item.id_item)}
                    disabled={loading}
                    className="bg-red-500 text-white py-1 px-4 rounded-md disabled:opacity-50 hover:bg-red-600 transition-colors">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PersediaanMUA;
