// TransaksiNCModels.js
import db from "../config/Database.js";

class TransaksiNC {

    static async createTransaksi(data) {
        try {
            // Format tanggal untuk MySQL
            let tanggalTransaksi = data.tanggal_transaksi;
            let tanggalPengambilan = data.tanggal_pengambilan;

            // Konversi format tanggal jika dalam bentuk ISO string
            if (tanggalTransaksi && typeof tanggalTransaksi === 'string' && tanggalTransaksi.includes('T')) {
                const date = new Date(tanggalTransaksi);
                tanggalTransaksi = date.toISOString().split('T')[0]; // Ambil hanya bagian YYYY-MM-DD
            }

            if (tanggalPengambilan && typeof tanggalPengambilan === 'string' && tanggalPengambilan.includes('T')) {
                const date = new Date(tanggalPengambilan);
                tanggalPengambilan = date.toISOString().split('T')[0]; // Ambil hanya bagian YYYY-MM-DD
            }

            const [result] = await db.execute(
                `INSERT INTO transaksi_nc (
        tanggal_transaksi,
        tanggal_pengambilan,
        waktu_pengambilan,
        total_harga,
        metode_pembayaran,
        jumlah_dibayar,
        status_pembayaran,
        atas_nama,
        catatan,
        items,
        additional_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tanggalTransaksi,
                    tanggalPengambilan,
                    data.waktu_pengambilan,
                    data.total_harga,
                    data.metode_pembayaran,
                    data.jumlah_dibayar,
                    data.status_pembayaran,
                    data.atas_nama,
                    data.catatan,
                    JSON.stringify(data.items),
                    JSON.stringify(data.additional_items || []),
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error("Error in createTransaksi:", error);
            throw error;
        }
    }

  static async getAllTransaksi() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM transaksi_nc 
        ORDER BY tanggal_transaksi DESC, waktu_pengambilan ASC
      `);

      // Parse JSON strings back to objects
      return rows.map((row) => ({
        ...row,
        items: JSON.parse(row.items),
        additional_items: row.additional_items
          ? JSON.parse(row.additional_items)
          : [],
      }));
    } catch (error) {
      console.error("Error in getAllTransaksi:", error);
      throw error;
    }
  }

  static async getTransaksiById(id_transaksi) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM transaksi_nc WHERE id_transaksi = ?",
        [id_transaksi]
      );

      if (rows.length === 0) {
        return null;
      }

      // Parse JSON strings back to objects
      return {
        ...rows[0],
        items: JSON.parse(rows[0].items),
        additional_items: rows[0].additional_items
          ? JSON.parse(rows[0].additional_items)
          : [],
      };
    } catch (error) {
      console.error("Error in getTransaksiById:", error);
      throw error;
    }
  }

    static async updateTransaksi(id_transaksi, data) {
        try {
            // Format tanggal untuk MySQL
            let tanggalTransaksi = data.tanggal_transaksi;
            let tanggalPengambilan = data.tanggal_pengambilan;

            // Konversi format tanggal jika dalam bentuk ISO string
            if (tanggalTransaksi && typeof tanggalTransaksi === 'string' && tanggalTransaksi.includes('T')) {
                const date = new Date(tanggalTransaksi);
                tanggalTransaksi = date.toISOString().split('T')[0]; // Ambil hanya bagian YYYY-MM-DD
            }

            if (tanggalPengambilan && typeof tanggalPengambilan === 'string' && tanggalPengambilan.includes('T')) {
                const date = new Date(tanggalPengambilan);
                tanggalPengambilan = date.toISOString().split('T')[0]; // Ambil hanya bagian YYYY-MM-DD
            }

            const [result] = await db.execute(
                `UPDATE transaksi_nc SET
        tanggal_transaksi = ?,
        tanggal_pengambilan = ?,
        waktu_pengambilan = ?,
        total_harga = ?,
        metode_pembayaran = ?,
        jumlah_dibayar = ?,
        status_pembayaran = ?,
        atas_nama = ?,
        catatan = ?,
        items = ?,
        additional_items = ?,
        status_kue = ?
      WHERE id_transaksi = ?`,
                [
                    tanggalTransaksi,
                    tanggalPengambilan,
                    data.waktu_pengambilan,
                    data.total_harga,
                    data.metode_pembayaran,
                    data.jumlah_dibayar,
                    data.status_pembayaran,
                    data.atas_nama,
                    data.catatan,
                    JSON.stringify(data.items),
                    JSON.stringify(data.additional_items || []),
                    data.status_kue,
                    id_transaksi,
                ]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in updateTransaksi:", error);
            throw error;
        }
    }

  static async deleteTransaksi(id_transaksi) {
    try {
      const [result] = await db.execute(
        "DELETE FROM transaksi_nc WHERE id_transaksi = ?",
        [id_transaksi]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in deleteTransaksi:", error);
      throw error;
    }
  }
}

export default TransaksiNC;
