import db from "../config/Database.js";

class ProdukNC {
  // CRUD untuk kategori_produk_nc
  //   Mengambil semua data kategori.
  static async findAllKategori() {
    const sql = `SELECT * FROM kategori_produk_nc`;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //   Mengambil data kategori berdasarkan id_kategori.
  static async findOneKategori(id_kategori) {
    try {
      console.log("findOneKategori id_kategori:", id_kategori); // Debug log
      const sql = `SELECT * FROM kategori_produk_nc WHERE id_kategori = ?`;
      const [rows] = await db.execute(sql, [id_kategori]);
      console.log("Hasil findOneKategori:", rows); // Debug log hasil query
      return rows[0];
    } catch (error) {
      console.error("Error findOneKategori:", error);
      throw error;
    }
  }

  // Mencari kategori berdasarkan nama_kategori
  static async findKategoriByNama(nama_kategori) {
    const sql = `SELECT * FROM kategori_produk_nc WHERE nama_kategori = ?`;
    const [rows] = await db.execute(sql, [nama_kategori]);
    return rows[0]; // Mengembalikan kategori jika ditemukan, atau null jika tidak ada
  }

  //   Menambahkan kategori baru.
  static async createKategori(data) {
    if (!data || !data.nama_kategori) {
      throw new Error("Nama kategori harus diisi.");
    }
    const sql = `INSERT INTO kategori_produk_nc (nama_kategori) VALUES (?)`;
    const [result] = await db.execute(sql, [data.nama_kategori]);
    return result.insertId;
  }

  //   Memperbarui kategori berdasarkan id_kategori.
  static async updateKategori(id_kategori, data) {
    const sql = `UPDATE kategori_produk_nc SET nama_kategori = ? WHERE id_kategori = ?`;
    const [result] = await db.execute(sql, [data.nama_kategori, id_kategori]);
    return result.affectedRows;
  }

  //   Menghapus kategori berdasarkan id_kategori.
  static async deleteKategori(id_kategori) {
    const sql = `DELETE FROM kategori_produk_nc WHERE id_kategori = ?`;
    const [result] = await db.execute(sql, [id_kategori]);
    return result.affectedRows;
  }

  // CRUD untuk produk_nc
  //   Mengambil semua data produk beserta nama kategori.
  static async findAllProduk() {
    const sql = `
      SELECT 
        p.id_produk, 
        p.nama_produk, 
        k.nama_kategori, 
        p.modal_produk, 
        p.harga_jual, 
        p.jumlah_stok, 
        p.gambar
      FROM produk_nc p
      JOIN kategori_produk_nc k ON p.id_kategori = k.id_kategori
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //   Mengambil data produk berdasarkan id_produk beserta nama kategori.
  static async findOneProduk({ id_produk }) {
    if (!id_produk) {
      throw new Error("id_produk harus ada");
    }
    const sql = `
      SELECT 
        p.id_produk, 
        p.nama_produk, 
        k.nama_kategori, 
        p.modal_produk, 
        p.harga_jual, 
        p.jumlah_stok, 
        p.gambar
      FROM produk_nc p
      JOIN kategori_produk_nc k ON p.id_kategori = k.id_kategori
      WHERE p.id_produk = ?
    `;
    const [result] = await db.execute(sql, [id_produk]);
    return result[0]; // Pastikan mengakses data yang tepat
  }

  //   Menambahkan produk baru.
  static async createProduk(data) {
    const sql = `
      INSERT INTO produk_nc (nama_produk, id_kategori, modal_produk, harga_jual, jumlah_stok, gambar) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      data.nama_produk,
      data.id_kategori,
      data.modal_produk,
      data.harga_jual,
      data.jumlah_stok,
      data.gambar || null,
    ]);
    return result.insertId;
  }

  //   Memperbarui produk berdasarkan id_produk.
  static async updateProduk(id_produk, data) {
    const sql = `
      UPDATE produk_nc SET 
        nama_produk = ?, 
        id_kategori = ?, 
        modal_produk = ?, 
        harga_jual = ?, 
        jumlah_stok = ?, 
        gambar = ? 
      WHERE id_produk = ?
    `;
    const [result] = await db.execute(sql, [
      data.nama_produk,
      data.id_kategori,
      data.modal_produk,
      data.harga_jual,
      data.jumlah_stok,
      data.gambar || null,
      id_produk,
    ]);
    return result.affectedRows;
  }

  //   Menghapus produk berdasarkan id_produk.
  static async deleteProduk(id_produk) {
    const sql = `DELETE FROM produk_nc WHERE id_produk = ?`;
    const [result] = await db.execute(sql, [id_produk]);
    return result.affectedRows;
  }
}

export default ProdukNC;
