// models/HargaKueModel.js
import db from "../config/Database.js";

class HargaKue {
  static async findAll() {
    const sql = `SELECT * FROM harga_kue ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findOne(id) {
    const sql = `SELECT * FROM harga_kue WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO harga_kue (
        jenis_kue,
        variasi,
        ukuran,
        kotak,
        harga
      ) VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi,
      data.ukuran,
      data.kotak,
      data.harga
    ]);
    return result.insertId;
  }

  static async update(id, data) {
    const sql = `
      UPDATE harga_kue SET
        jenis_kue = ?,
        variasi = ?,
        ukuran = ?,
        kotak = ?,
        harga = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi,
      data.ukuran,
      data.kotak,
      data.harga,
      id
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = `DELETE FROM harga_kue WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows;
  }
}

export default HargaKue;