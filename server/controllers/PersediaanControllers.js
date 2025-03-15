// PersediaanControllers.js
import * as PersediaanModel from "../models/PersediaanModels.js";

export const getAllPersediaan = async (req, res) => {
  try {
    const results = await PersediaanModel.getAllItems();
    res.json(results);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving inventory items",
      error: err.message,
    });
  }
};

export const getPersediaanById = async (req, res) => {
  try {
    const id = req.params.id_item;
    const result = await PersediaanModel.getItemById(id);

    if (!result) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving item",
      error: err.message,
    });
  }
};

export const createPersediaan = async (req, res) => {
  try {
    const result = await PersediaanModel.createItem(req.body);
    res.status(201).json({
      message: "Item created successfully",
      data: { id: result.insertId, ...req.body },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating item",
      error: err.message,
    });
  }
};

export const updatePersediaan = async (req, res) => {
  try {
    const id = req.params.id_item;
    const result = await PersediaanModel.updateItem(id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json({
      message: "Item updated successfully",
      data: { id, ...req.body },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating item",
      error: err.message,
    });
  }
};

export const deletePersediaan = async (req, res) => {
  try {
    const id = req.params.id_item;
    const result = await PersediaanModel.deleteItem(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json({
      message: "Item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting item",
      error: err.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const id = req.params.id_item;
    const { status } = req.body;
    const result = await PersediaanModel.updateItemStatus(id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json({
      message: "Item status updated successfully",
      data: { id, status },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating item status",
      error: err.message,
    });
  }
};
