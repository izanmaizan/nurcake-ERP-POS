// models/KriteriaJenisKueModel.js
import db from "../config/Database.js";

class KriteriaJenisKue {
  static async findAll() {
    const sql = `SELECT * FROM kriteria_jenis_kue ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async create(nama) {
    const sql = `INSERT INTO kriteria_jenis_kue (nama) VALUES (?)`;
    const [result] = await db.execute(sql, [nama]);
    return result.insertId;
  }

  static async delete(id) {
    const sql = `DELETE FROM kriteria_jenis_kue WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows;
  }
}
