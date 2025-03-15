import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-hot-toast";

const KueReady = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    jenis_kue: "",
    variasi_kue: "",
    ukuran_kue: "",
    aksesoris_kue: "",
    modal_pembuatan: "",
    harga_jual: "",
    gambar: null,
    imagePreview: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        gambar: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "imagePreview") {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      await axios.post("http://localhost:3000/kue-ready", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Kue berhasil ditambahkan");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.msg || "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-900">
            Pesan Kue Jadi
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label className="text-[#DAA520]" htmlFor="jenis_kue">
                Jenis Kue
              </Label>
              <Input
                id="jenis_kue"
                name="jenis_kue"
                value={formData.jenis_kue}
                onChange={handleChange}
                placeholder="Masukkan jenis kue"
                required
              />
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="variasi_kue">
                Variasi Kue
              </Label>
              <Input
                id="variasi_kue"
                name="variasi_kue"
                value={formData.variasi_kue}
                onChange={handleChange}
                placeholder="Masukkan variasi kue"
                required
              />
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="ukuran_kue">
                Ukuran Kue
              </Label>
              <select
                id="ukuran_kue"
                name="ukuran_kue"
                value={formData.ukuran_kue}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-[#1a1a1a] text-[#DAA520] border border-[#FFD700]"
                required>
                <option value="">Pilih Ukuran</option>
                <option value="small">Small (12cm)</option>
                <option value="medium">Medium (14cm)</option>
                <option value="large">Large (16cm)</option>
                <option value="xlarge">Extra Large (18cm)</option>
              </select>
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="aksesoris_kue">
                Aksesoris Kue
              </Label>
              <Input
                id="aksesoris_kue"
                name="aksesoris_kue"
                value={formData.aksesoris_kue}
                onChange={handleChange}
                placeholder="Masukkan aksesoris kue"
              />
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="modal_pembuatan">
                Modal Pembuatan
              </Label>
              <Input
                id="modal_pembuatan"
                name="modal_pembuatan"
                type="number"
                value={formData.modal_pembuatan}
                onChange={handleChange}
                placeholder="Masukkan modal pembuatan"
                required
              />
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="harga_jual">
                Harga Jual
              </Label>
              <Input
                id="harga_jual"
                name="harga_jual"
                type="number"
                value={formData.harga_jual}
                onChange={handleChange}
                placeholder="Masukkan harga jual"
                required
              />
            </div>

            <div>
              <Label className="text-[#DAA520]" htmlFor="gambar">
                Unggah Gambar
              </Label>
              <Input
                id="gambar"
                name="gambar"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
                accept="image/*"
              />
              {formData.imagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border border-[#FFD700]">
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KueReady;
