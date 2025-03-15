// controllers/HargaKueController.js
import DaftarKriteria from "../models/DaftarKriteriaModel.js";
import HargaKue from "./HargaKueModel.js";

// Controllers untuk Daftar Kriteria
export const getAllKriteria = async (req, res) => {
  try {
    const kriteria = await DaftarKriteria.findAll();
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getKriteriaById = async (req, res) => {
  try {
    const kriteria = await DaftarKriteria.findOne(req.params.id);
    if (!kriteria) {
      return res.status(404).json({ msg: "Kriteria tidak ditemukan" });
    }
    res.json(kriteria);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createKriteria = async (req, res) => {
  try {
    const { jenis_kue, variasi_kue, ukuran_kue, kotak_kue } = req.body;
    const newId = await DaftarKriteria.create({
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      kotak_kue,
    });
    res.status(201).json({
      msg: "Kriteria berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const updateKriteria = async (req, res) => {
  try {
    const { jenis_kue, variasi_kue, ukuran_kue, kotak_kue } = req.body;
    const updatedRows = await DaftarKriteria.update(req.params.id, {
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      kotak_kue,
    });
    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Kriteria tidak ditemukan" });
    }
    res.json({ msg: "Kriteria berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteKriteria = async (req, res) => {
  try {
    const deletedRows = await DaftarKriteria.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Kriteria tidak ditemukan" });
    }
    res.json({ msg: "Kriteria berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Controllers untuk Harga Kue
export const getAllHarga = async (req, res) => {
  try {
    const harga = await HargaKue.findAll();
    res.json(harga);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getHargaById = async (req, res) => {
  try {
    const harga = await HargaKue.findOne(req.params.id);
    if (!harga) {
      return res.status(404).json({ msg: "Data harga tidak ditemukan" });
    }
    res.json(harga);
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createHarga = async (req, res) => {
  try {
    const { jenis_kue, variasi, ukuran, kotak, harga } = req.body;
    const newId = await HargaKue.create({
      jenis_kue,
      variasi,
      ukuran,
      kotak,
      harga: parseFloat(harga),
    });
    res.status(201).json({
      msg: "Data harga berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const updateHarga = async (req, res) => {
  try {
    const { jenis_kue, variasi, ukuran, kotak, harga } = req.body;
    const updatedRows = await HargaKue.update(req.params.id, {
      jenis_kue,
      variasi,
      ukuran,
      kotak,
      harga: parseFloat(harga),
    });
    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Data harga tidak ditemukan" });
    }
    res.json({ msg: "Data harga berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteHarga = async (req, res) => {
  try {
    const deletedRows = await HargaKue.delete(req.params.id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Data harga tidak ditemukan" });
    }
    res.json({ msg: "Data harga berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
