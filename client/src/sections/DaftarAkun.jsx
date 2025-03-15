import React, { useEffect, useState } from "react";
import axios from "axios";
import TambahAkun from "./TambahAkun";
import { Link, useNavigate } from "react-router-dom";

const DaftarAkun = () => {
  const [akunList, setAkunList] = useState([]);
  const [showAddAkun, setShowAddAkun] = useState(false);
  const [loading, setLoading] = useState(true);
  const [akunToEdit, setAkunToEdit] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const timeout = setTimeout(() => {
        setMsg("Loading berlangsung lama, mohon login kembali.");
        setLoading(false);
      }, 10000);

      const response = await axios.get("http://localhost:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });

      clearTimeout(timeout);
      const data = response.data;
      setUsername(data.username);
      setRole(data.role);
      localStorage.setItem("username", data.username);

      if (data.role === "admin") {
        fetchAkunList();
      } else {
        setMsg(
          "Anda tidak punya akses ke halaman ini. Dikembalikan ke Halaman Utama..."
        );
        setTimeout(() => navigate("/"), 3000);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data: " + error);
      setMsg("Terjadi kesalahan, mohon login kembali.");
      setLoading(false);
    }
  };

  const fetchAkunList = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      if (Array.isArray(response.data)) {
        setAkunList(response.data);
      } else {
        console.error("Format data tidak sesuai.");
        setAkunList([]);
      }
    } catch (error) {
      console.error("Gagal mengambil daftar akun:", error);
      alert("Gagal mengambil daftar akun.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchAkunList();
    setShowAddAkun(false);
  };

  const handleEditAkun = (akun) => {
    setAkunToEdit(akun);
    setShowAddAkun(true);
  };

  const handleConfirmDelete = (username) => {
    setItemToDelete(username);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/delete-user/${itemToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      handleSuccess();
    } catch (error) {
      console.error("Gagal menghapus akun:", error);
      alert("Gagal menghapus akun.");
    } finally {
      setShowConfirmDelete(false);
      setItemToDelete(null);
    }
  };

  const filteredAkunList = akunList.filter((akun) =>
    akun.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-[#1a1a1a] min-h-screen py-16 px-5 h-full w-full md:py-20 md:px-20">
      {msg && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#2d2d2d] rounded-lg shadow-lg p-8 border border-[#FFD700]">
            <p className="text-center text-[#FFD700]">{msg}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setMsg("")}
                className="bg-[#FFD700] text-[#1a1a1a] px-4 py-2 rounded hover:bg-[#DAA520] transition duration-300">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-[40px] font-semibold mb-5 text-[#FFD700] font-Roboto">
        Daftar Akun
      </h1>
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <button
          onClick={() => {
            setAkunToEdit(null);
            setShowAddAkun(true);
          }}
          className="bg-[#FFD700] text-[#1a1a1a] px-4 py-2 rounded-2xl shadow-md hover:bg-[#DAA520] transition duration-300">
          Tambah Akun
        </button>
      </div>

      {showAddAkun && (
        <TambahAkun
          user={akunToEdit}
          onClose={() => setShowAddAkun(false)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari akun..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-[#FFD700] bg-[#2d2d2d] text-[#FFD700] px-4 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-[#DAA520] placeholder-[#DAA520]"
        />
      </div>

      {loading ? (
        <p className="text-[#FFD700]">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#2d2d2d] shadow-md rounded-lg overflow-hidden border border-[#FFD700]">
            <thead className="bg-[#3d3d3d] text-[#FFD700] border-[#FFD700] border-b">
              <tr>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#FFD700]">
                  Username
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#FFD700]">
                  Nama
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#FFD700]">
                  Peran
                </th>
                <th className="px-4 md:px-6 py-2 md:py-3 border-b border-[#FFD700]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAkunList.length > 0 ? (
                filteredAkunList.map((akun) => (
                  <tr
                    key={akun.id}
                    className="hover:bg-[#3d3d3d] transition duration-200">
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#FFD700] text-[#DAA520]">
                      {akun.username}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#FFD700] text-[#DAA520]">
                      {akun.name || "N/A"}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#FFD700] text-[#DAA520]">
                      {akun.role || "N/A"}
                    </td>
                    <td className="px-4 md:px-6 py-2 md:py-4 border-b border-[#FFD700]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAkun(akun)}
                          className="text-[#FFD700] hover:text-[#DAA520] transition duration-200">
                          Ubah
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(akun.username)}
                          className="text-rose-400 hover:text-rose-300 transition duration-200">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-[#DAA520]">
                    Tidak ada akun ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-[#2d2d2d] p-4 rounded-lg shadow-lg w-80 border border-[#FFD700]">
            <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">
              Konfirmasi Penghapusan
            </h3>
            <p className="text-[#DAA520]">
              Apakah Anda yakin ingin menghapus akun ini? Operasi ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-[#3d3d3d] text-[#FFD700] px-4 py-2 rounded hover:bg-[#4d4d4d] transition duration-200">
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition duration-200">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DaftarAkun;
