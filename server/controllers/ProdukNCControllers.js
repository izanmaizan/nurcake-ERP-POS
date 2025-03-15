//ProdukNCControllers.js
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import ProdukNC from "../models/ProdukNCModels.js";

// Konfigurasi multer untuk unggah file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    const extension = file.originalname.split(".").pop();
    cb(null, `${uniqueSuffix}.${extension}`);
  },
});

// Filter file untuk validasi tipe file (hanya gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipe file tidak valid. Hanya JPEG dan PNG yang diperbolehkan.")
    );
  }
};

// Limit ukuran file sampai 10MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: fileFilter,
});

// Menambahkan kategori produk
export const createKategoriProduk = async (req, res) => {
  const { nama_kategori } = req.body;

  try {
    const kategoriExists = await ProdukNC.findKategoriByNama(nama_kategori);
    if (kategoriExists) {
      return res.status(409).json({ msg: "Kategori produk sudah ada" });
    }

    const newKategoriId = await ProdukNC.createKategori({ nama_kategori });
    res
      .status(201)
      .json({ msg: "Kategori produk berhasil ditambahkan", id: newKategoriId });
  } catch (error) {
    console.error("Error menambahkan kategori:", error);
    res
      .status(500)
      .json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Mengambil semua kategori produk
export const getAllKategoriProduk = async (req, res) => {
  try {
    const kategoriList = await ProdukNC.findAllKategori();
    res.json(kategoriList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Mengupdate kategori produk
export const updateKategoriProduk = async (req, res) => {
  const { id_kategori } = req.params;
  const { nama_kategori } = req.body;

  if (!id_kategori || !nama_kategori) {
    return res.status(400).json({ msg: "Parameter atau body tidak valid" });
  }

  try {
    const kategoriExists = await ProdukNC.findOneKategori(id_kategori);
    if (!kategoriExists) {
      return res.status(404).json({ msg: "Kategori produk tidak ditemukan" });
    }

    const updatedRows = await ProdukNC.updateKategori(id_kategori, {
      nama_kategori,
    });
    if (updatedRows === 0) {
      return res.status(400).json({ msg: "Update kategori produk gagal" });
    }

    res.json({ msg: "Kategori produk berhasil diperbarui" });
  } catch (error) {
    console.error("Error update kategori:", error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Menghapus kategori produk
export const deleteKategoriProduk = async (req, res) => {
  const { id_kategori } = req.params;

  try {
    const deletedRows = await ProdukNC.deleteKategori(id_kategori);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Kategori produk tidak ditemukan" });
    }

    res.json({ msg: "Kategori produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Menambahkan produk baru
export const createProduk = async (req, res) => {
  try {
    const { nama_produk, id_kategori, modal_produk, harga_jual, jumlah_stok } =
      req.body;

    // Ambil nama file gambar jika ada upload
    const gambar = req.file ? "uploads/" + req.file.filename : null;

    if (!id_kategori) {
      return res.status(400).json({ msg: "ID Kategori tidak boleh kosong." });
    }

    const kategoriExists = await ProdukNC.findOneKategori(id_kategori);
    if (!kategoriExists) {
      return res.status(404).json({ msg: "Kategori produk tidak ditemukan." });
    }

    const newProdukId = await ProdukNC.createProduk({
      nama_produk,
      id_kategori,
      modal_produk,
      harga_jual,
      jumlah_stok,
      gambar,
    });

    res.status(201).json({
      msg: "Produk berhasil ditambahkan",
      id: newProdukId,
    });
  } catch (error) {
    console.error("Error menambahkan produk:", error);
    res.status(500).json({
      msg: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// Mengambil semua produk
export const getAllProduk = async (req, res) => {
  try {
    const produkList = await ProdukNC.findAllProduk();
    res.json(produkList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Mengambil produk berdasarkan ID
export const getProdukById = async (req, res) => {
  const { id_produk } = req.params;

  try {
    const produk = await ProdukNC.findOneProduk({ id_produk });
    if (!produk) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }
    res.json(produk);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Mengupdate produk
export const updateProduk = async (req, res) => {
  const { id_produk } = req.params;
  const { nama_produk, id_kategori, modal_produk, harga_jual, jumlah_stok } =
    req.body;
  const gambar = req.file ? "uploads/" + req.file.filename : null;

  try {
    const produkExists = await ProdukNC.findOneProduk({ id_produk });
    if (!produkExists) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    const updatedRows = await ProdukNC.updateProduk(id_produk, {
      nama_produk,
      id_kategori,
      modal_produk,
      harga_jual,
      jumlah_stok,
      gambar,
    });

    if (updatedRows === 0) {
      return res.status(400).json({ msg: "Update produk gagal" });
    }

    res.json({ msg: "Produk berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Menghapus produk
export const deleteProduk = async (req, res) => {
  const { id_produk } = req.params;

  try {
    const deletedRows = await ProdukNC.deleteProduk(id_produk);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    res.json({ msg: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
