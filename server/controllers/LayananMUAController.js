// controllers/LayananMUAController.js
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import LayananMUA from "../models/LayananMUAModel.js";

// Konfigurasi multer untuk upload gambar
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

export const uploadmodel = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Controller untuk Layanan MUA
export const createLayanan = async (req, res) => {
  try {
    const { nama_paket, kategori, kisaran_modal, harga, layanan } = req.body;
    const gambar = req.file ? "uploads/" + req.file.filename : null;

    const layananString = Array.isArray(layanan)
      ? JSON.stringify(layanan)
      : layanan;

    const newLayananId = await LayananMUA.createLayanan({
      nama_paket,
      kategori,
      kisaran_modal,
      harga,
      layanan: layananString,
      gambar,
    });

    res.status(201).json({
      msg: "Layanan berhasil ditambahkan",
      id: newLayananId,
    });
  } catch (error) {
    console.error("Error creating layanan:", error);
    res.status(500).json({
      msg: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const getAllLayanan = async (req, res) => {
  try {
    const layananList = await LayananMUA.findAllLayanan();
    res.json(layananList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const updateLayanan = async (req, res) => {
  const { id_layanan } = req.params;
  const { nama_paket, kategori, kisaran_modal, harga, layanan } = req.body;
  const gambar = req.file ? "uploads/" + req.file.filename : undefined;

  try {
    const updatedData = {
      nama_paket,
      kategori,
      kisaran_modal,
      harga,
      layanan: JSON.stringify(layanan),
      ...(gambar && { gambar }),
    };

    const updatedRows = await LayananMUA.updateLayanan(id_layanan, updatedData);

    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Layanan tidak ditemukan" });
    }

    res.json({ msg: "Layanan berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const deleteLayanan = async (req, res) => {
  const { id_layanan } = req.params;

  try {
    const deletedRows = await LayananMUA.deleteLayanan(id_layanan);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Layanan tidak ditemukan" });
    }

    res.json({ msg: "Layanan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

// Controller untuk Booking
export const createBooking = async (req, res) => {
  try {
    const {
      tanggal_booking,
      waktu_mulai,
      waktu_selesai,
      id_layanan,
      nama_pelanggan,
      no_telepon,
      alamat,
      total_harga,
      dp_amount,
      sisa_pembayaran,
      catatan,
    } = req.body;

    const newBookingId = await LayananMUA.createBooking({
      tanggal_booking,
      waktu_mulai,
      waktu_selesai,
      id_layanan,
      nama_pelanggan,
      no_telepon,
      alamat,
      total_harga,
      status_booking: "Pending",
      dp_amount,
      sisa_pembayaran,
      catatan,
    });

    res.status(201).json({
      msg: "Booking berhasil dibuat",
      id: newBookingId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      msg: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id_booking } = req.params;
  const { status_booking } = req.body;

  try {
    const updatedRows = await LayananMUA.updateBookingStatus(
      id_booking,
      status_booking
    );

    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Booking tidak ditemukan" });
    }

    res.json({ msg: "Status booking berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await LayananMUA.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};
