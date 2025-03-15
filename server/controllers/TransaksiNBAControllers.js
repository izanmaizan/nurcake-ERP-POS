// TransaksiNBAControllers.js
import * as TransaksiNBAModel from "../models/TransaksiNBAModels.js";

export const getAllTransaksiNBA = async (req, res) => {
  try {
    const results = await TransaksiNBAModel.getAllTransaksi();
    res.json(results);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving transactions",
      error: err.message,
    });
  }
};

export const getTransaksiNBAById = async (req, res) => {
  try {
    const id = req.params.id_transaksi;
    const result = await TransaksiNBAModel.getTransaksiById(id);

    if (!result) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving transaction",
      error: err.message,
    });
  }
};

export const createTransaksiNBA = async (req, res) => {
  try {
    const result = await TransaksiNBAModel.createTransaksi(req.body);
    res.status(201).json({
      message: "Transaction created successfully",
      data: { id: result.insertId, ...req.body },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating transaction",
      error: err.message,
    });
  }
};

export const updateTransaksiNBA = async (req, res) => {
  try {
    const id = req.params.id_transaksi;
    const result = await TransaksiNBAModel.updateTransaksi(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction updated successfully",
      data: { id, ...req.body },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating transaction",
      error: err.message,
    });
  }
};
