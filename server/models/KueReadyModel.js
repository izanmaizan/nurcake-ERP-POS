import db from "../config/Database.js";

class KueReady {
  static async findAll() {
    const sql = `SELECT * FROM kue_ready ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findOne(id_kue) {
    const sql = `SELECT * FROM kue_ready WHERE id_kue = ?`;
    const [rows] = await db.execute(sql, [id_kue]);
    return rows[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO kue_ready (
        jenis_kue, 
        variasi_kue, 
        ukuran_kue, 
        aksesoris_kue, 
        modal_pembuatan, 
        harga_jual, 
        gambar
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi_kue,
      data.ukuran_kue,
      data.aksesoris_kue,
      data.modal_pembuatan,
      data.harga_jual,
      data.gambar || null,
    ]);
    return result.insertId;
  }

  static async update(id_kue, data) {
    const sql = `
      UPDATE kue_ready SET 
        jenis_kue = ?, 
        variasi_kue = ?, 
        ukuran_kue = ?, 
        aksesoris_kue = ?, 
        modal_pembuatan = ?, 
        harga_jual = ?, 
        gambar = ?
      WHERE id_kue = ?
    `;
    const [result] = await db.execute(sql, [
      data.jenis_kue,
      data.variasi_kue,
      data.ukuran_kue,
      data.aksesoris_kue,
      data.modal_pembuatan,
      data.harga_jual,
      data.gambar || null,
      id_kue,
    ]);
    return result.affectedRows;
  }

  static async delete(id_kue) {
    const sql = `DELETE FROM kue_ready WHERE id_kue = ?`;
    const [result] = await db.execute(sql, [id_kue]);
    return result.affectedRows;
  }
}

export default KueReady;
