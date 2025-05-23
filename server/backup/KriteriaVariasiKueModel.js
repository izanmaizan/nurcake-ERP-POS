// models/KriteriaVariasiKueModel.js
class KriteriaVariasiKue {
  static async findAll() {
    const sql = `SELECT * FROM kriteria_variasi_kue ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async create(nama) {
    const sql = `INSERT INTO kriteria_variasi_kue (nama) VALUES (?)`;
    const [result] = await db.execute(sql, [nama]);
    return result.insertId;
  }

  static async delete(id) {
    const sql = `DELETE FROM kriteria_variasi_kue WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows;
  }
}
