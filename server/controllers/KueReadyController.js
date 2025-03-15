import KueReady from "../models/KueReadyModel.js";

export const getAllKueReady = async (req, res) => {
  try {
    const kueList = await KueReady.findAll();
    res.json(kueList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getKueReadyById = async (req, res) => {
  const { id_kue } = req.params;
  try {
    const kue = await KueReady.findOne(id_kue);
    if (!kue) {
      return res.status(404).json({ msg: "Kue tidak ditemukan" });
    }
    res.json(kue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const createKueReady = async (req, res) => {
  try {
    const {
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      aksesoris_kue,
      modal_pembuatan,
      harga_jual,
    } = req.body;

    const gambar = req.file ? "uploads/" + req.file.filename : null;

    const newKueId = await KueReady.create({
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      aksesoris_kue,
      modal_pembuatan,
      harga_jual,
      gambar,
    });

    res.status(201).json({
      msg: "Kue berhasil ditambahkan",
      id: newKueId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const updateKueReady = async (req, res) => {
  const { id_kue } = req.params;
  try {
    const {
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      aksesoris_kue,
      modal_pembuatan,
      harga_jual,
    } = req.body;

    const gambar = req.file ? "uploads/" + req.file.filename : null;

    const updatedRows = await KueReady.update(id_kue, {
      jenis_kue,
      variasi_kue,
      ukuran_kue,
      aksesoris_kue,
      modal_pembuatan,
      harga_jual,
      gambar,
    });

    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Kue tidak ditemukan" });
    }

    res.json({ msg: "Kue berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteKueReady = async (req, res) => {
  const { id_kue } = req.params;
  try {
    const deletedRows = await KueReady.delete(id_kue);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Kue tidak ditemukan" });
    }
    res.json({ msg: "Kue berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
