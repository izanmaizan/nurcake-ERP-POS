// models/KriteriaModel.js
import db from "../config/Database.js";

export class KriteriaModel {
  static async findAllJenisKue() {
    const [rows] = await db.execute(
      "SELECT * FROM kriteria_jenis_kue ORDER BY nama"
    );
    return rows;
  }

  static async findAllVariasiKue() {
    const [rows] = await db.execute(
      "SELECT * FROM kriteria_variasi_kue ORDER BY nama"
    );
    return rows;
  }

  static async findAllUkuranKue() {
    const [rows] = await db.execute(
      "SELECT * FROM kriteria_ukuran_kue ORDER BY nama"
    );
    return rows;
  }

  static async findAllKotakKue() {
    const [rows] = await db.execute(
      "SELECT * FROM kriteria_kotak_kue ORDER BY nama"
    );
    return rows;
  }

  static async createJenisKue(nama) {
    const [result] = await db.execute(
      "INSERT INTO kriteria_jenis_kue (nama) VALUES (?)",
      [nama]
    );
    return result.insertId;
  }

  static async createVariasiKue(nama) {
    const [result] = await db.execute(
      "INSERT INTO kriteria_variasi_kue (nama) VALUES (?)",
      [nama]
    );
    return result.insertId;
  }

  static async createUkuranKue(nama) {
    const [result] = await db.execute(
      "INSERT INTO kriteria_ukuran_kue (nama) VALUES (?)",
      [nama]
    );
    return result.insertId;
  }

  static async createKotakKue(nama) {
    const [result] = await db.execute(
      "INSERT INTO kriteria_kotak_kue (nama) VALUES (?)",
      [nama]
    );
    return result.insertId;
  }

  static async deleteJenisKue(id) {
    const [result] = await db.execute(
      "DELETE FROM kriteria_jenis_kue WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async deleteVariasiKue(id) {
    const [result] = await db.execute(
      "DELETE FROM kriteria_variasi_kue WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async deleteUkuranKue(id) {
    const [result] = await db.execute(
      "DELETE FROM kriteria_ukuran_kue WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async deleteKotakKue(id) {
    const [result] = await db.execute(
      "DELETE FROM kriteria_kotak_kue WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }
}
