// models/HargaKueModel.js
import db from "../config/Database.js";

export class HargaKueModel {
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT * FROM harga_kue 
      ORDER BY created_at DESC
    `);
    return rows;
  }

  static async findOne(id) {
    const [rows] = await db.execute("SELECT * FROM harga_kue WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO harga_kue (
        jenis_kue, variasi, ukuran, kotak, modal, harga
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi,
      data.ukuran,
      data.kotak,
      data.modal,
      data.harga,
    ]);
    return result.insertId;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM harga_kue WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}
