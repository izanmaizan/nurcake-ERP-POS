// controllers/KriteriaController.js
import { KriteriaModel } from "../models/KriteriaModel.js";

export const getAllKriteria = async (req, res) => {
  try {
    const [jenisKue, variasiKue, ukuranKue, kotakKue] = await Promise.all([
      KriteriaModel.findAllJenisKue(),
      KriteriaModel.findAllVariasiKue(),
      KriteriaModel.findAllUkuranKue(),
      KriteriaModel.findAllKotakKue(),
    ]);

    res.json({
      jenisKue,
      variasi: variasiKue,
      ukuran: ukuranKue,
      kotak: kotakKue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createKriteria = async (req, res) => {
  try {
    const { type, nama } = req.body;
    let newId;

    switch (type) {
      case "jenisKue":
        newId = await KriteriaModel.createJenisKue(nama);
        break;
      case "variasi":
        newId = await KriteriaModel.createVariasiKue(nama);
        break;
      case "ukuran":
        newId = await KriteriaModel.createUkuranKue(nama);
        break;
      case "kotak":
        newId = await KriteriaModel.createKotakKue(nama);
        break;
      default:
        return res.status(400).json({ msg: "Tipe kriteria tidak valid" });
    }

    res.status(201).json({
      msg: "Kriteria berhasil ditambahkan",
      id: newId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteKriteria = async (req, res) => {
  try {
    const { type, id } = req.params;
    let deletedRows;

    switch (type) {
      case "jenisKue":
        deletedRows = await KriteriaModel.deleteJenisKue(id);
        break;
      case "variasi":
        deletedRows = await KriteriaModel.deleteVariasiKue(id);
        break;
      case "ukuran":
        deletedRows = await KriteriaModel.deleteUkuranKue(id);
        break;
      case "kotak":
        deletedRows = await KriteriaModel.deleteKotakKue(id);
        break;
      default:
        return res.status(400).json({ msg: "Tipe kriteria tidak valid" });
    }

    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Kriteria tidak ditemukan" });
    }

    res.json({ msg: "Kriteria berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
