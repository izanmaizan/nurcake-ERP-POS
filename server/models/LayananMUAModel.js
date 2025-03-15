// models/LayananMUAModel.js
import db from "../config/Database.js";

class LayananMUA {
  // Layanan CRUD
  static async createLayanan(data) {
    const sql = `
      INSERT INTO layanan_nmua 
      (nama_paket, kategori, kisaran_modal, harga, layanan, gambar) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.nama_paket,
      data.kategori,
      parseInt(data.kisaran_modal),
      parseInt(data.harga),
      data.layanan,
      data.gambar,
    ]);
    return result.insertId;
  }

  static async findAllLayanan() {
    const sql = `SELECT * FROM layanan_nmua`;
    const [rows] = await db.execute(sql);
    return rows.map((row) => ({
      ...row,
      // Pastikan parsing JSON dilakukan dengan aman
      layanan: JSON.parse(row.layanan || "[]"),
    }));
  }

  static async updateLayanan(id_layanan, data) {
    const sql = `
      UPDATE layanan_nmua 
      SET nama_paket = ?, 
          kategori = ?, 
          kisaran_modal = ?,
          harga = ?, 
          layanan = ?
          ${data.gambar ? ", gambar = ?" : ""}
      WHERE id_layanan = ?
    `;

    const params = [
      data.nama_paket,
      data.kategori,
      parseInt(data.kisaran_modal),
      parseInt(data.harga),
      data.layanan,
      ...(data.gambar ? [data.gambar] : []),
      id_layanan,
    ];

    const [result] = await db.execute(sql, params);
    return result.affectedRows;
  }

  static async deleteLayanan(id_layanan) {
    const sql = `DELETE FROM layanan_nmua WHERE id_layanan = ?`;
    const [result] = await db.execute(sql, [id_layanan]);
    return result.affectedRows;
  }

  // Booking CRUD
  static async createBooking(data) {
    const sql = `
          INSERT INTO booking_nmua 
          (tanggal_booking, waktu_mulai, waktu_selesai, id_layanan, 
           nama_pelanggan, no_telepon, alamat, total_harga, 
           status_booking, dp_amount, sisa_pembayaran, catatan)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const [result] = await db.execute(sql, [
      data.tanggal_booking,
      data.waktu_mulai,
      data.waktu_selesai,
      data.id_layanan,
      data.nama_pelanggan,
      data.no_telepon,
      data.alamat,
      parseInt(data.total_harga), // Konversi ke integer
      data.status_booking,
      parseInt(data.dp_amount), // Konversi ke integer
      parseInt(data.sisa_pembayaran), // Konversi ke integer
      data.catatan,
    ]);

    return result.insertId;
  }

  static async updateBookingStatus(id_booking, status_booking) {
    const sql = `
      UPDATE booking_nmua 
      SET status_booking = ?
      WHERE id_booking = ?
    `;

    const [result] = await db.execute(sql, [status_booking, id_booking]);
    return result.affectedRows;
  }

  static async getAllBookings() {
    const sql = `
      SELECT b.*, l.nama_paket, l.kisaran_modal 
      FROM booking_nmua b
      LEFT JOIN layanan_nmua l ON b.id_layanan = l.id_layanan
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
}

export default LayananMUA;
