// PersediaanModels.js
import db from "../config/Database.js";

export const getAllItems = async () => {
  const query = `
    SELECT * FROM persediaan_nmua 
    ORDER BY nama_item ASC
    `;

  const [rows] = await db.query(query);
  return rows;
};

export const getItemById = async (id) => {
  const query = `
    SELECT * FROM persediaan_nmua 
    WHERE id_item = ?
    `;

  const [rows] = await db.query(query, [id]);
  return rows[0];
};

export const createItem = async (data) => {
  const query = `
    INSERT INTO persediaan_nmua (
        nama_item,
        kategori,
        merek,
        jumlah,
        satuan,
        minimal_stok,
        tanggal_beli,
        tanggal_kadaluarsa,
        harga_beli,
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const [result] = await db.query(query, [
    data.nama_item,
    data.kategori,
    data.merek || null,
    data.jumlah,
    data.satuan || null,
    data.minimal_stok || 1,
    data.tanggal_beli || null,
    data.tanggal_kadaluarsa || null,
    data.harga_beli || null,
    data.status || "Tersedia",
  ]);

  return result;
};

export const updateItem = async (id, data) => {
  const query = `
    UPDATE persediaan_nmua 
    SET 
        nama_item = ?,
        kategori = ?,
        merek = ?,
        jumlah = ?,
        satuan = ?,
        minimal_stok = ?,
        tanggal_beli = ?,
        tanggal_kadaluarsa = ?,
        harga_beli = ?,
        status = ?
    WHERE id_item = ?
    `;

  const [result] = await db.query(query, [
    data.nama_item,
    data.kategori,
    data.merek || null,
    data.jumlah,
    data.satuan || null,
    data.minimal_stok || 1,
    data.tanggal_beli || null,
    data.tanggal_kadaluarsa || null,
    data.harga_beli || null,
    data.status || "Tersedia",
    id,
  ]);

  return result;
};

export const deleteItem = async (id) => {
  const query = `
    DELETE FROM persediaan_nmua 
    WHERE id_item = ?
    `;

  const [result] = await db.query(query, [id]);
  return result;
};

export const updateItemStatus = async (id, status) => {
  const query = `
    UPDATE persediaan_nmua 
    SET status = ?
    WHERE id_item = ?
    `;

  const [result] = await db.query(query, [status, id]);
  return result;
};
