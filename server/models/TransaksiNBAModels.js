// TransaksiNBAModels.js;
import db from "../config/Database.js";

export const getAllTransaksi = async () => {
  const query = `
      SELECT t.*, p.modal_pembuatan 
      FROM transaksi_nba t
      LEFT JOIN produk_nba p ON t.id_produk = p.id_produk
    `;

  const [rows] = await db.query(query);
  return rows;
};

export const getTransaksiById = async (id) => {
  const query = `
    SELECT * FROM transaksi_nba 
    WHERE id_transaksi = ?
    `;

  const [rows] = await db.query(query, [id]);
  return rows[0];
};

export const createTransaksi = async (data) => {
  const query = `
    INSERT INTO transaksi_nba (
      tanggal_transaksi, 
      tanggal_pengambilan,
      id_produk, 
      jumlah, 
      harga_satuan, 
      total_harga,
      jumlah_dibayar,
      kembalian,
      utang, 
      metode_pembayaran, 
      status_pembayaran,
      nama_pelanggan, 
      no_telepon, 
      catatan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.query(query, [
    data.tanggal_transaksi || new Date(),
    data.tanggal_pengambilan,
    data.id_produk,
    data.jumlah,
    data.harga_satuan,
    data.total_harga,
    data.jumlah_dibayar || 0,
    data.kembalian || 0,
    data.utang || 0,
    data.metode_pembayaran,
    data.status_pembayaran || "Belum Lunas",
    data.nama_pelanggan,
    data.no_telepon,
    data.catatan || null,
  ]);

  return result;
};

export const updateTransaksi = async (id, data) => {
  const query = `
    UPDATE transaksi_nba 
    SET 
      tanggal_transaksi = ?,
      id_produk = ?,
      jumlah = ?,
      harga_satuan = ?,
      total_harga = ?,
      jumlah_dibayar = ?,
      kembalian = ?,
      utang = ?,
      metode_pembayaran = ?,
      status_pembayaran = ?,
      nama_pelanggan = ?,
      no_telepon = ?,
      catatan = ?
    WHERE id_transaksi = ?
    `;

  const [result] = await db.query(query, [
    data.tanggal_transaksi,
    data.id_produk,
    data.jumlah,
    data.harga_satuan,
    data.total_harga,
    data.jumlah_dibayar,
    data.kembalian,
    data.utang,
    data.metode_pembayaran,
    data.status_pembayaran,
    data.nama_pelanggan,
    data.no_telepon,
    data.catatan,
    id,
  ]);

  return result;
};
