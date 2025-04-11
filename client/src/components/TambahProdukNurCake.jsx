import React, { useState, useEffect } from "react";
import axios from "axios";

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"];
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

const TambahProdukNurCake = ({ produk, onClose, onSuccess }) => {
  const [namaProduk, setNamaProduk] = useState("");
  const [kategori, setKategori] = useState("");
  const [modal, setModal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stok, setStok] = useState("");
  const [gambar, setGambar] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const response = await axios.get(`${API}/kategori-produk`);
        setKategoriList(response.data);

        // Jika dalam mode edit, set kategori yang sesuai
        if (
            produk &&
            produk.id_kategori !== undefined &&
            produk.id_kategori !== null
        ) {
          // Temukan kategori yang sesuai dengan id_kategori
          const selectedKategori = response.data.find(
              (kat) => kat.id_kategori === produk.id_kategori
          );

          // Set kategori dengan id_kategori
          if (selectedKategori) {
            setKategori(selectedKategori.id_kategori.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching kategori:", error);
        setKategoriList([]);
      }
    };

    fetchKategori();

    if (produk) {
      // Set state produk lainnya
      produk.nama_produk !== undefined && setNamaProduk(produk.nama_produk);
      produk.modal_produk !== undefined && setModal(produk.modal_produk);
      produk.harga_jual !== undefined && setHargaJual(produk.harga_jual);
      produk.jumlah_stok !== undefined && setStok(produk.jumlah_stok);

      setIsEditing(true);

      if (produk.gambar) {
        setImagePreview(`${API}/${produk.gambar}`);
        fetch(`${API}/${produk.gambar}`)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], produk.gambar, { type: "image/*" });
              setGambar(file);
            })
            .catch((error) => console.error("Error fetching image:", error));
      }
    }
  }, [produk]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambar(file);
      setImagePreview(URL.createObjectURL(file)); // Preview sementara di browser
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form
    if (!namaProduk || !kategori || !modal || !hargaJual || !stok) {
      setError("Silahkan isi semua kolom kecuali gambar untuk edit.");
      return;
    }

    const formData = new FormData();
    formData.append("nama_produk", namaProduk);
    formData.append("id_kategori", kategori);
    formData.append("modal_produk", modal);
    formData.append("harga_jual", hargaJual);
    formData.append("jumlah_stok", stok);

    // Hanya append gambar jika ada gambar baru yang dipilih
    if (gambar && (!isEditing || gambar instanceof File)) {
      formData.append("gambar", gambar);
    }

    try {
      if (isEditing) {
        await axios.put(
            `${API}/produkNC/${produk.id_produk}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
        );
        alert("Produk berhasil diperbarui!");
      } else {
        // Untuk produk baru, gambar harus ada
        if (!gambar) {
          setError("Silahkan upload gambar produk.");
          return;
        }
        await axios.post(`${API}/produkNC`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Produk berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(
          `Gagal ${isEditing ? "memperbarui" : "menambahkan"} produk: ${
              error.response?.data?.message || error.message
          }`
      );
    }
  };

  return (
      // Tambah Produk Nur Cake
      <section className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-[#FAF3E0] p-4 md:p-6 border border-[#D4AF37] rounded-lg shadow-lg max-h-[90vh] w-full max-w-lg overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-extrabold mb-4 text-[#8B7D3F]">
            {isEditing ? "Ubah Produk" : "Tambah Produk"}
          </h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="namaProduk">
                Nama Produk
              </label>
              <input
                  id="namaProduk"
                  type="text"
                  value={namaProduk}
                  onChange={(e) => setNamaProduk(e.target.value)}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="kategori">
                Kategori Produk
              </label>
              <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]">
                <option value="" disabled>
                  Pilih Kategori
                </option>
                {kategoriList.map((kat) => (
                    <option
                        key={kat.id_kategori}
                        value={kat.id_kategori.toString()}
                        className="bg-[#FFF8E7]">
                      {kat.nama_kategori}
                    </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="modal">
                Modal Produk
              </label>
              <input
                  id="modal"
                  type="number"
                  value={modal}
                  onChange={(e) => setModal(e.target.value)}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="hargaJual">
                Harga Jual
              </label>
              <input
                  id="hargaJual"
                  type="number"
                  value={hargaJual}
                  onChange={(e) => setHargaJual(e.target.value)}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="stok">
                Jumlah Stok
              </label>
              <input
                  id="stok"
                  type="number"
                  value={stok}
                  onChange={(e) => setStok(e.target.value)}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-[#8B7D3F]" htmlFor="gambar">
                Unggah Gambar
              </label>
              <input
                  id="gambar"
                  type="file"
                  onChange={handleFileChange}
                  className="bg-[#FFF8E7] border border-[#C5B358] text-[#8B7D3F] px-4 py-2 w-full rounded-lg focus:outline-none focus:border-[#D4AF37] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:text-white"
              />
              {imagePreview && (
                  <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-4 w-full h-auto max-h-40 object-cover rounded-lg border border-[#C5B358]"
                  />
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                  type="submit"
                  className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#C5B358] font-semibold transition-colors w-full sm:w-auto">
                {isEditing ? "Perbarui" : "Tambah"} Produk
              </button>
              <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#FFF8E7] text-[#8B7D3F] px-4 py-2 rounded-lg hover:bg-[#FAF3E0] border border-[#C5B358] transition-colors w-full sm:w-auto">
                Batal
              </button>
            </div>
          </form>
        </div>
      </section>
  );
};

export default TambahProdukNurCake;