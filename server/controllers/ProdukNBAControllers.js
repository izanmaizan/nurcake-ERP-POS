import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import ProdukNBA from "../models/ProdukNBAModels.js";

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

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Format file tidak valid. Hanya JPEG, JPG dan PNG yang diperbolehkan."
      )
    );
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

export const getAllProdukNBA = async (req, res) => {
  try {
    const produkList = await ProdukNBA.findAllProduk();
    res.json(produkList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getProdukByIdNBA = async (req, res) => {
  try {
    const produk = await ProdukNBA.findOneProduk(req.params.id_produk);
    if (!produk) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }
    res.json(produk);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createProdukNBA = async (req, res) => {
  try {
    const {
      nama_produk,
      kategori,
      harga,
      modal_pembuatan,
      deskripsi,
      stok,
      status,
    } = req.body;
    const foto_produk = req.file ? `uploads/${req.file.filename}` : null;

    const newProdukId = await ProdukNBA.createProduk({
      nama_produk,
      kategori,
      harga,
      modal_pembuatan,
      deskripsi,
      stok,
      foto_produk,
      status,
    });

    res.status(201).json({
      msg: "Produk berhasil ditambahkan",
      id: newProdukId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const updateProdukNBA = async (req, res) => {
  try {
    const { id_produk } = req.params;
    const {
      nama_produk,
      kategori,
      harga,
      modal_pembuatan,
      deskripsi,
      stok,
      status,
    } = req.body;
    const foto_produk = req.file ? `uploads/${req.file.filename}` : null;

    const updatedRows = await ProdukNBA.updateProduk(id_produk, {
      nama_produk,
      kategori,
      harga,
      modal_pembuatan,
      deskripsi,
      stok,
      foto_produk,
      status,
    });

    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    res.json({ msg: "Produk berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteProdukNBA = async (req, res) => {
  try {
    const deletedRows = await ProdukNBA.deleteProduk(req.params.id_produk);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }
    res.json({ msg: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
