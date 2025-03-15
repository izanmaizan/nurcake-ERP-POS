// TransaksiNCControllers.js
import TransaksiNC from "../models/TransaksiNCModels.js";

export const createTransaksi = async (req, res) => {
  try {
    const {
      tanggal_transaksi,
      tanggal_pengambilan,
      waktu_pengambilan,
      total_harga,
      metode_pembayaran,
      jumlah_dibayar,
      status_pembayaran,
      atas_nama,
      catatan,
      items,
      additional_items,
    } = req.body;

    // Validate required fields
    if (
      !tanggal_transaksi ||
      !items ||
      !total_harga ||
      !metode_pembayaran ||
      !atas_nama
    ) {
      return res.status(400).json({
        message: "Data transaksi tidak lengkap",
      });
    }

    const transactionId = await TransaksiNC.createTransaksi({
      tanggal_transaksi,
      tanggal_pengambilan,
      waktu_pengambilan,
      total_harga,
      metode_pembayaran,
      jumlah_dibayar,
      status_pembayaran,
      atas_nama,
      catatan,
      items,
      additional_items,
    });

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      id_transaksi: transactionId,
    });
  } catch (error) {
    console.error("Error dalam membuat transaksi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan dalam membuat transaksi",
      error: error.message,
    });
  }
};

export const getAllTransaksi = async (req, res) => {
  try {
    const transactions = await TransaksiNC.getAllTransaksi();
    res.json(transactions);
  } catch (error) {
    console.error("Error dalam mengambil transaksi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan dalam mengambil data transaksi",
      error: error.message,
    });
  }
};

export const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await TransaksiNC.getTransaksiById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error dalam mengambil detail transaksi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan dalam mengambil detail transaksi",
      error: error.message,
    });
  }
};

export const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tanggal_transaksi,
      tanggal_pengambilan,
      waktu_pengambilan,
      total_harga,
      metode_pembayaran,
      jumlah_dibayar,
      status_pembayaran,
      atas_nama,
      catatan,
      items,
      additional_items,
      status_kue,
    } = req.body;

    // Validate required fields
    if (
      !tanggal_transaksi ||
      !items ||
      !total_harga ||
      !metode_pembayaran ||
      !atas_nama
    ) {
      return res.status(400).json({
        message: "Data transaksi tidak lengkap",
      });
    }

    const updated = await TransaksiNC.updateTransaksi(id, {
      tanggal_transaksi,
      tanggal_pengambilan,
      waktu_pengambilan,
      total_harga,
      metode_pembayaran,
      jumlah_dibayar,
      status_pembayaran,
      atas_nama,
      catatan,
      items,
      additional_items,
      status_kue,
    });

    if (!updated) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      message: "Transaksi berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error dalam memperbarui transaksi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan dalam memperbarui transaksi",
      error: error.message,
    });
  }
};

export const deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TransaksiNC.deleteTransaksi(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.json({
      message: "Transaksi berhasil dihapus",
    });
  } catch (error) {
    console.error("Error dalam menghapus transaksi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan dalam menghapus transaksi",
      error: error.message,
    });
  }
};
