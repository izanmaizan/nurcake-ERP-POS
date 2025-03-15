// models/DaftarKriteriaModel.js
import db from "../config/Database.js";

class DaftarKriteria {
  static async findAll() {
    const sql = `SELECT * FROM daftar_kriteria ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findOne(id) {
    const sql = `SELECT * FROM daftar_kriteria WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO daftar_kriteria (
        jenis_kue,
        variasi_kue,
        ukuran_kue,
        kotak_kue
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi_kue,
      data.ukuran_kue,
      data.kotak_kue,
    ]);
    return result.insertId;
  }

  static async update(id, data) {
    const sql = `
      UPDATE daftar_kriteria SET
        jenis_kue = ?,
        variasi_kue = ?,
        ukuran_kue = ?,
        kotak_kue = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi_kue,
      data.ukuran_kue,
      data.kotak_kue,
      id,
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = `DELETE FROM daftar_kriteria WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows;
  }
}

export default DaftarKriteria;
