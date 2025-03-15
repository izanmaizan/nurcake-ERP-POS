import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  getUsers,
  Register,
  Login,
  Me,
  Logout,
  updateAkun,
  deleteUserByUsername,
} from "../controllers/Users.js";
import {
  createCheckPoint,
  deleteCheckPoint,
  getCheckPoints,
  updateCheckPoint,
} from "../controllers/CheckPoint.js";
import { getLaporan } from "../controllers/Laporan.js";
import {
  deleteDetail,
  getDetail,
  updateDetail,
} from "../controllers/Detail.js";
import {
  createTitikLokasi,
  deleteTitikLokasi,
  getLokasiWithPetugasDanGeofence,
  getTitikLokasi,
  getTitikLokasiById,
  updateTitikLokasi,
} from "../controllers/TitikLokasiController.js";
import {
  createPetugas,
  deletePetugas,
  getPetugasByLokasi,
  getPetugasByLokasiAndId,
  updatePetugas,
} from "../controllers/PetugasController.js";
import {
  createOrUpdateGeofence,
  getGeofence,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
} from "../controllers/GeofenceController.js";
import {
  getAllKategoriProduk,
  createKategoriProduk,
  createProduk,
  updateProduk,
  deleteProduk,
  getAllProduk,
  getProdukById,
  updateKategoriProduk,
  deleteKategoriProduk,
} from "../controllers/ProdukNCControllers.js";
import {
  getAllKueReady,
  getKueReadyById,
  createKueReady,
  updateKueReady,
  deleteKueReady,
} from "../controllers/KueReadyController.js";

import {
  getAllKriteria,
  createKriteria,
  deleteKriteria,
} from "../controllers/KriteriaController.js";
import {
  getAllHargaKue,
  createHargaKue,
  deleteHargaKue,
} from "../controllers/HargaKueController.js";
import {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  updateTransaksi,
  deleteTransaksi,
} from "../controllers/TransaksiNCControllers.js";
import {
  getAllProdukNBA,
  createProdukNBA,
  getProdukByIdNBA,
  updateProdukNBA,
  deleteProdukNBA,
} from "../controllers/ProdukNBAControllers.js";
import {
  createTransaksiNBA,
  getAllTransaksiNBA,
  getTransaksiNBAById,
  updateTransaksiNBA,
} from "../controllers/TransaksiNBAControllers.js";
import {
  createLayanan,
  getAllLayanan,
  updateLayanan,
  deleteLayanan,
  createBooking,
  updateBookingStatus,
  uploadmodel,
  getAllBookings,
} from "../controllers/LayananMUAController.js";
import {
  getAllPersediaan,
  getPersediaanById,
  createPersediaan,
  updatePersediaan,
  deletePersediaan,
  updateStatus,
} from "../controllers/PersediaanControllers.js";

import multer from "multer";
import { v4 as uuidv4 } from "uuid";

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter,
});

const router = express.Router();

router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// User Routes
router.get("/users", getUsers);
router.post("/register", Register);
router.post("/login", Login);
router.get("/me", Me);
router.post("/logout", Logout);
router.put("/update-akun/:username", updateAkun);
router.delete("/delete-user/:username", deleteUserByUsername);

// Checkpoint Routes
router.get("/checkpoints", getCheckPoints);
router.post("/checkpoints", createCheckPoint);
router.get("/checkpoints/:no_do", getCheckPoints);
router.put("/checkpoints/:no_do", updateCheckPoint);
router.delete("/checkpoints/:no_do", deleteCheckPoint);

// Laporan Routes
router.get("/laporan", getLaporan);

// Detail Routes
router.get("/detail/:no_do", getDetail);
router.put("/detail/:no_do", updateDetail);
router.delete("/detail/:no_do", deleteDetail);

// Titik Lokasi Routes
router.get("/titiklokasi", getTitikLokasi);
router.post("/titiklokasi", createTitikLokasi);
router.get("/titiklokasi/:id_lokasi", getTitikLokasiById);
router.put("/titiklokasi/:id_lokasi", updateTitikLokasi);
router.delete("/titiklokasi/:id_lokasi", deleteTitikLokasi);

// Lokasi Routes
router.get("/lokasi-with-details", getLokasiWithPetugasDanGeofence);

// Petugas Routes
router.post("/petugas", createPetugas);
router.get("/petugas/:id_lokasi", getPetugasByLokasi);
router.get("/petugas/:id_lokasi/:id_petugas", getPetugasByLokasiAndId);
router.put("/petugas/:id_petugas", updatePetugas);
router.delete("/petugas/:id_petugas", deletePetugas);

// Geofence Routes
router.post("/geofence", createOrUpdateGeofence);
router.get("/geofence", getGeofence);
router.get("/geofence/:id", getGeofenceById);
router.put("/geofence/:id", updateGeofence);
router.delete("/geofence/:id", deleteGeofence);

// Routes untuk kategori produk
router.get("/kategori-produk", getAllKategoriProduk); // Mengambil semua kategori produk
router.post("/kategori-produk", createKategoriProduk); // Membuat kategori produk baru
router.put("/kategori-produk/:id_kategori", updateKategoriProduk); // Mengupdate kategori produk berdasarkan ID
router.delete("/kategori-produk/:id_kategori", deleteKategoriProduk); // Menghapus kategori produk berdasarkan ID

// Routes untuk produk
router.get("/produkNC", getAllProduk);
router.post("/produkNC", upload.single("gambar"), createProduk); // Gunakan middleware upload
router.get("/produkNC/:id_produk", getProdukById);
router.put("/produkNC/:id_produk", upload.single("gambar"), updateProduk); // Tambahkan juga untuk update
router.delete("/produkNC/:id_produk", deleteProduk);

// Kue Ready Routes
router.get("/kue-ready", getAllKueReady);
router.get("/kue-ready/:id_kue", getKueReadyById);
router.post("/kue-ready", upload.single("gambar"), createKueReady);
router.put("/kue-ready/:id_kue", upload.single("gambar"), updateKueReady);
router.delete("/kue-ready/:id_kue", deleteKueReady);

// Kriteria routes
router.get("/kriteria", getAllKriteria);
router.post("/kriteria", createKriteria);
router.delete("/kriteria/:type/:id", deleteKriteria);

// Harga Kue routes
router.get("/harga-kue", getAllHargaKue);
router.post("/harga-kue", createHargaKue);
router.delete("/harga-kue/:id", deleteHargaKue);

// Routes untuk transaksi POS Nur Cake
router.post("/transaksi-nc", createTransaksi);
router.get("/transaksi-nc", getAllTransaksi);
router.get("/transaksi-nc/:id", getTransaksiById);
router.put("/transaksi-nc/:id", updateTransaksi);
router.delete("/transaksi-nc/:id", deleteTransaksi);

// Routes untuk produk NBA
router.get("/produkNBA", getAllProdukNBA);
router.post("/produkNBA", upload.single("foto_produk"), createProdukNBA);
router.get("/produkNBA/:id_produk", getProdukByIdNBA);
router.put(
  "/produkNBA/:id_produk",
  upload.single("foto_produk"),
  updateProdukNBA
);
router.delete("/produkNBA/:id_produk", deleteProdukNBA);

// Routes (add to your existing routes file)
router.post("/transaksi-nba", createTransaksiNBA);
router.get("/transaksi-nba", getAllTransaksiNBA);
router.get("/transaksi-nba/:id_transaksi", getTransaksiNBAById);
router.put("/transaksi-nba/:id_transaksi", updateTransaksiNBA);

// Layanan routes
router.post("/layanan", uploadmodel.single("gambar"), createLayanan);
router.get("/layanan", getAllLayanan);
router.put("/layanan/:id_layanan", uploadmodel.single("gambar"), updateLayanan);
router.delete("/layanan/:id_layanan", deleteLayanan);

// Booking routes
router.post("/booking", createBooking);
router.put("/booking/:id_booking/status", updateBookingStatus);

// Di routes
router.get("/booking", getAllBookings);

// Persediaan MUA routes
router.get("/persediaan", getAllPersediaan);
router.get("/persediaan/:id_item", getPersediaanById);
router.post("/persediaan", createPersediaan);
router.put("/persediaan/:id_item", updatePersediaan);
router.delete("/persediaan/:id_item", deletePersediaan);
router.put("/persediaan/:id_item/status", updateStatus);

export default router;
