// controllers/HargaKueController.js
import { HargaKueModel } from "../models/HargaKueModel.js";

export const getAllHargaKue = async (req, res) => {
  try {
    const hargaList = await HargaKueModel.findAll();
    res.json(hargaList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createHargaKue = async (req, res) => {
  try {
    const { jenis_kue, variasi, ukuran, kotak, modal, harga } = req.body;
    const newId = await HargaKueModel.create({
      jenis_kue,
      variasi,
      ukuran,
      kotak,
      modal,
      harga,
    });

    res.status(201).json({
      msg: "Harga kue berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteHargaKue = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await HargaKueModel.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Harga kue tidak ditemukan" });
    }

    res.json({ msg: "Harga kue berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
