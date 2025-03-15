// TransaksiNBAModels.js
import db from "../config/Database.js";

class ProdukNBA {
  static async findAllProduk() {
    const sql = `SELECT * FROM produk_nba ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async findOneProduk(id_produk) {
    const sql = `SELECT * FROM produk_nba WHERE id_produk = ?`;
    const [rows] = await db.execute(sql, [id_produk]);
    return rows[0];
  }

  static async createProduk(data) {
    const sql = `
      INSERT INTO produk_nba (
        nama_produk, 
        kategori, 
        harga,
        modal_pembuatan,
        deskripsi, 
        stok, 
        foto_produk,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.nama_produk,
      data.kategori,
      data.harga,
      data.modal_pembuatan,
      data.deskripsi,
      data.stok,
      data.foto_produk,
      data.status || "Tersedia",
    ]);
    return result.insertId;
  }

  static async updateProduk(id_produk, data) {
    const sql = `
      UPDATE produk_nba 
      SET nama_produk = ?, 
          kategori = ?, 
          harga = ?,
          modal_pembuatan = ?,
          deskripsi = ?, 
          stok = ?, 
          foto_produk = COALESCE(?, foto_produk),
          status = ?
      WHERE id_produk = ?
    `;
    const [result] = await db.execute(sql, [
      data.nama_produk,
      data.kategori,
      data.harga,
      data.modal_pembuatan,
      data.deskripsi,
      data.stok,
      data.foto_produk,
      data.status,
      id_produk,
    ]);
    return result.affectedRows;
  }

  static async deleteProduk(id_produk) {
    const sql = `DELETE FROM produk_nba WHERE id_produk = ?`;
    const [result] = await db.execute(sql, [id_produk]);
    return result.affectedRows;
  }

  static async updateStatus(id_produk, status) {
    const sql = `UPDATE produk_nba SET status = ? WHERE id_produk = ?`;
    const [result] = await db.execute(sql, [status, id_produk]);
    return result.affectedRows;
  }
}

export default ProdukNBA;
