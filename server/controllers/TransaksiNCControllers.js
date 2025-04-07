// TransaksiNCControllers.js
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import TransaksiNC from "../models/TransaksiNCModels.js";


// Konfigurasi multer (sama seperti konfigurasi existing)
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
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
        new Error("Tipe file tidak valid. Hanya JPEG dan PNG yang diperbolehkan.")
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: fileFilter,
});

// Upload handler untuk multiple file dengan nama field dinamis
const uploadCakeImages = upload.any();

export const createTransaksi = async (req, res) => {
  uploadCakeImages(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error saat upload gambar",
        error: err.message,
      });
    }

    try {
      // Parse data transaksi dari FormData
      const transaksiData = JSON.parse(req.body.data);
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
      } = transaksiData;

      // Validate required fields
      if (
          !tanggal_transaksi ||
          !items ||
          !total_harga ||
          !metode_pembayaran ||
          !atas_nama
      ) {
        // Hapus file jika validasi gagal
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }

        return res.status(400).json({
          message: "Data transaksi tidak lengkap",
        });
      }

      // Proses file yang diupload
      const imagePaths = [];
      if (req.files && req.files.length > 0) {
        // Perbarui item dengan path gambar yang diupload
        items.forEach((item, itemIndex) => {
          if (item.tipe === "custom_cake" && item.gambar_model_refs) {
            // Inisialisasi array gambar jika belum ada
            if (!item.gambar_model) {
              item.gambar_model = [];
            }

            // Cari file yang sesuai dan tambahkan path-nya ke item
            item.gambar_model_refs.forEach((refKey, imgIndex) => {
              const uploadedFile = req.files.find(file => file.fieldname === refKey);
              if (uploadedFile) {
                // Simpan path relatif yang akan disimpan di database
                const serverPath = `uploads/${uploadedFile.filename}`;
                item.gambar_model.push(serverPath);

                // Simpan informasi untuk response
                imagePaths.push({
                  itemImageIds: `${itemIndex}_${imgIndex}`,
                  serverPath
                });
              }
            });

            // Hapus referensi setelah selesai diproses
            delete item.gambar_model_refs;
          }
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
        imagePaths: imagePaths.length > 0 ? imagePaths : null
      });
    } catch (error) {
      console.error("Error dalam membuat transaksi:", error);

      // Hapus file yang sudah diupload jika terjadi error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        message: "Terjadi kesalahan dalam membuat transaksi",
        error: error.message,
      });
    }
  });
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
