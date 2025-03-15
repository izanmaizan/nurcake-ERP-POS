import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllHarga = async (req, res) => {
  try {
    const harga = await prisma.harga.findMany();
    res.json(harga);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHargaById = async (req, res) => {
  try {
    const harga = await prisma.harga.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (!harga) {
      return res.status(404).json({ message: "Harga tidak ditemukan" });
    }
    res.json(harga);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHarga = async (req, res) => {
  try {
    const { jenis_kue, variasi, ukuran, kotak, harga } = req.body;
    const newHarga = await prisma.harga.create({
      data: {
        jenis_kue,
        variasi,
        ukuran,
        kotak,
        harga: parseFloat(harga),
      },
    });
    res.status(201).json(newHarga);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateHarga = async (req, res) => {
  try {
    const { jenis_kue, variasi, ukuran, kotak, harga } = req.body;
    const updatedHarga = await prisma.harga.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        jenis_kue,
        variasi,
        ukuran,
        kotak,
        harga: parseFloat(harga),
      },
    });
    res.json(updatedHarga);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHarga = async (req, res) => {
  try {
    await prisma.harga.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.json({ message: "Harga berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
