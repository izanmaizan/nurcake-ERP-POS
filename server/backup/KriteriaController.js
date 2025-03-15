// controllers/KriteriaController.js
import {
  KriteriaJenisKue,
  KriteriaVariasiKue,
  KriteriaUkuranKue,
  KriteriaKotakKue,
} from "./KriteriaModels.js";

// Jenis Kue Controllers
export const getAllJenisKue = async (req, res) => {
  try {
    const kriteria = await KriteriaJenisKue.findAll();
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createJenisKue = async (req, res) => {
  try {
    const { nama } = req.body;
    const newId = await KriteriaJenisKue.create(nama);
    res.status(201).json({
      msg: "Jenis kue berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteJenisKue = async (req, res) => {
  try {
    const deletedRows = await KriteriaJenisKue.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Jenis kue tidak ditemukan" });
    }
    res.json({ msg: "Jenis kue berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Variasi Kue Controllers
export const getAllVariasiKue = async (req, res) => {
  try {
    const kriteria = await KriteriaVariasiKue.findAll();
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createVariasiKue = async (req, res) => {
  try {
    const { nama } = req.body;
    const newId = await KriteriaVariasiKue.create(nama);
    res.status(201).json({
      msg: "Variasi kue berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteVariasiKue = async (req, res) => {
  try {
    const deletedRows = await KriteriaVariasiKue.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Variasi kue tidak ditemukan" });
    }
    res.json({ msg: "Variasi kue berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Ukuran Kue Controllers
export const getAllUkuranKue = async (req, res) => {
  try {
    const kriteria = await KriteriaUkuranKue.findAll();
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createUkuranKue = async (req, res) => {
  try {
    const { nama } = req.body;
    const newId = await KriteriaUkuranKue.create(nama);
    res.status(201).json({
      msg: "Ukuran kue berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteUkuranKue = async (req, res) => {
  try {
    const deletedRows = await KriteriaUkuranKue.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Ukuran kue tidak ditemukan" });
    }
    res.json({ msg: "Ukuran kue berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Kotak Kue Controllers
export const getAllKotakKue = async (req, res) => {
  try {
    const kriteria = await KriteriaKotakKue.findAll();
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createKotakKue = async (req, res) => {
  try {
    const { nama } = req.body;
    const newId = await KriteriaKotakKue.create(nama);
    res.status(201).json({
      msg: "Kotak kue berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteKotakKue = async (req, res) => {
  try {
    const deletedRows = await KriteriaKotakKue.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Kotak kue tidak ditemukan" });
    }
    res.json({ msg: "Kotak kue berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
