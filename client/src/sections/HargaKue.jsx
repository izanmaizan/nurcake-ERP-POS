import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

// Base URL for API
const API_URL = "http://localhost:3000"; // Adjust this to match your backend URL

const KriteriaTable = ({ data, onDelete }) => (
  <Card className="bg-[#2d2d2d] border-[#FFD700] border">
    <CardHeader>
      <CardTitle className="text-[#FFD700]">Daftar Kriteria</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#FFD700]">
              <TableHead className="text-[#DAA520]">No</TableHead>
              <TableHead className="text-[#DAA520]">Jenis Kue</TableHead>
              <TableHead className="text-[#DAA520]">Variasi Kue</TableHead>
              <TableHead className="text-[#DAA520]">Ukuran Kue</TableHead>
              <TableHead className="text-[#DAA520]">Kotak Kue</TableHead>
              <TableHead className="text-[#DAA520] w-16">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(data).every((arr) => arr.length === 0) ? (
              <TableRow className="border-[#FFD700]">
                <TableCell colSpan={6} className="text-center text-[#DAA520]">
                  Belum ada data
                </TableCell>
              </TableRow>
            ) : (
              [
                ...Array(
                  Math.max(...Object.values(data).map((arr) => arr.length))
                ),
              ].map((_, index) => (
                <TableRow key={index} className="border-[#FFD700]">
                  <TableCell className="w-16 text-[#DAA520]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-[#DAA520]">
                    {data.jenisKue[index]?.nama || "-"}
                    {data.jenisKue[index] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onDelete("jenisKue", data.jenisKue[index].id)
                        }
                        className="ml-2 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-[#DAA520]">
                    {data.variasi[index]?.nama || "-"}
                    {data.variasi[index] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onDelete("variasi", data.variasi[index].id)
                        }
                        className="ml-2 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-[#DAA520]">
                    {data.ukuran[index]?.nama || "-"}
                    {data.ukuran[index] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onDelete("ukuran", data.ukuran[index].id)
                        }
                        className="ml-2 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-[#DAA520]">
                    {data.kotak[index]?.nama || "-"}
                    {data.kotak[index] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete("kotak", data.kotak[index].id)}
                        className="ml-2 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

const HargaKue = () => {
  const [newRule, setNewRule] = useState({
    jenisKue: "",
    variasi: "",
    ukuran: "",
    kotak: "",
    modal: "",
    harga: "",
  });

  const [rules, setRules] = useState([]);
  const [newKriteria, setNewKriteria] = useState({
    jenisKue: [],
    variasi: [],
    ukuran: [],
    kotak: [],
  });

  // State untuk pesan error pada input kriteria
  const [kriteriaErrors, setKriteriaErrors] = useState({
    jenisKue: "",
    variasi: "",
    ukuran: "",
    kotak: "",
  });

  // Fetch initial data
  useEffect(() => {
    fetchKriteria();
    fetchHargaKue();
  }, []);

  // Fetch all kriteria
  const fetchKriteria = async () => {
    try {
      const response = await axios.get(`${API_URL}/kriteria`);
      setNewKriteria(response.data);
    } catch (error) {
      console.error("Error fetching kriteria:", error);
      toast.error("Gagal mengambil data kriteria");
    }
  };

  // Fetch all harga kue
  const fetchHargaKue = async () => {
    try {
      const response = await axios.get(`${API_URL}/harga-kue`);
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching harga kue:", error);
      toast.error("Gagal mengambil data harga kue");
    }
  };

  // Add new kriteria
  const addKriteria = async (type, value) => {
    // Reset error message
    setKriteriaErrors({ ...kriteriaErrors, [type]: "" });

    // Cek apakah nama kriteria sudah ada
    if (value) {
      if (
        newKriteria[type].some(
          (item) => item.nama.toLowerCase() === value.toLowerCase()
        )
      ) {
        // Tampilkan pesan error
        setKriteriaErrors({ ...kriteriaErrors, [type]: "Sudah ada" });
        toast.warning(
          `${getKriteriaLabel(type)} dengan nama "${value}" sudah ada`
        );
        return;
      }

      try {
        await axios.post(`${API_URL}/kriteria`, {
          type,
          nama: value,
        });
        fetchKriteria(); // Refresh the list
        toast.success("Kriteria berhasil ditambahkan");
      } catch (error) {
        console.error("Error adding kriteria:", error);
        toast.error("Gagal menambahkan kriteria");
      }
    }
  };

  // Helper to get kriteria label
  const getKriteriaLabel = (type) => {
    const labels = {
      jenisKue: "Jenis Kue",
      variasi: "Variasi",
      ukuran: "Ukuran",
      kotak: "Kotak",
    };
    return labels[type] || type;
  };

  // Remove kriteria
  const removeKriteria = async (type, id) => {
    try {
      await axios.delete(`${API_URL}/kriteria/${type}/${id}`);
      fetchKriteria(); // Refresh the list
      toast.success("Kriteria berhasil dihapus");
    } catch (error) {
      console.error("Error removing kriteria:", error);
      toast.error("Gagal menghapus kriteria");
    }
  };

  // Add new price rule
  const addRule = async () => {
    try {
      const response = await axios.post(`${API_URL}/harga-kue`, {
        jenis_kue: newRule.jenisKue,
        variasi: newRule.variasi,
        ukuran: newRule.ukuran,
        kotak: newRule.kotak,
        modal: parseFloat(newRule.modal),
        harga: parseFloat(newRule.harga),
      });

      fetchHargaKue();
      setNewRule({
        jenisKue: "",
        variasi: "",
        ukuran: "",
        kotak: "",
        modal: "",
        harga: "",
      });
      toast.success("Harga kue berhasil ditambahkan");
    } catch (error) {
      console.error("Detailed Error:", error.response?.data || error.message);
      toast.error("Gagal menambahkan harga kue: " + error.message);
    }
  };

  // Delete price rule
  const deleteRule = async (id) => {
    try {
      await axios.delete(`${API_URL}/harga-kue/${id}`);
      fetchHargaKue(); // Refresh the list
      toast.success("Harga kue berhasil dihapus");
    } catch (error) {
      console.error("Error deleting price rule:", error);
      toast.error("Gagal menghapus harga kue");
    }
  };

  // Handle input kriteria
  const handleKriteriaInput = (type, e) => {
    // Reset error message saat input baru
    setKriteriaErrors({ ...kriteriaErrors, [type]: "" });

    if (e.key === "Enter" && e.target.value) {
      addKriteria(type, e.target.value);
      // Hanya bersihkan input jika berhasil ditambahkan (akan dibersihkan di addKriteria)
      if (!kriteriaErrors[type]) {
        e.target.value = "";
      }
    }
  };

  const kriteriaTypes = [
    { key: "jenisKue", label: "Jenis Kue" },
    { key: "variasi", label: "Variasi" },
    { key: "ukuran", label: "Ukuran" },
    { key: "kotak", label: "Kotak" },
  ];

  return (
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="p-4 space-y-6">
        {/* Bagian Input Kriteria */}
        <Card className="bg-[#2d2d2d] border-[#FFD700] border">
          <CardHeader>
            <CardTitle className="text-[#FFD700]">Tambah Kriteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kriteriaTypes.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <h3 className="font-medium text-[#DAA520]">{label}</h3>
                  <div className="relative">
                    <Input
                      placeholder={`${label} Baru`}
                      className={`bg-[#3d3d3d] border-[#FFD700] text-[#DAA520] placeholder:text-gray-500 ${
                        kriteriaErrors[key] ? "border-red-500" : ""
                      }`}
                      onKeyPress={(e) => handleKriteriaInput(key, e)}
                      onChange={() =>
                        setKriteriaErrors({ ...kriteriaErrors, [key]: "" })
                      }
                    />
                    {kriteriaErrors[key] && (
                      <div className="absolute right-2 top-2 text-red-500 text-sm">
                        {kriteriaErrors[key]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Combined Kriteria Table */}
        <KriteriaTable data={newKriteria} onDelete={removeKriteria} />

        {/* Bagian Input Rule */}
        <Card className="bg-[#2d2d2d] border-[#FFD700] border">
          <CardHeader>
            <CardTitle className="text-[#FFD700]">Tambah Rule Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                value={newRule.jenisKue}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, jenisKue: value })
                }>
                <SelectTrigger className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520]">
                  <SelectValue placeholder="Jenis Kue" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                  {newKriteria.jenisKue.map((jenis) => (
                    <SelectItem
                      key={jenis.id}
                      value={jenis.nama}
                      className="text-[#DAA520] hover:bg-[#3d3d3d]">
                      {jenis.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newRule.variasi}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, variasi: value })
                }>
                <SelectTrigger className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520]">
                  <SelectValue placeholder="Variasi" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                  {newKriteria.variasi.map((var_) => (
                    <SelectItem
                      key={var_.id}
                      value={var_.nama}
                      className="text-[#DAA520] hover:bg-[#3d3d3d]">
                      {var_.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newRule.ukuran}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, ukuran: value })
                }>
                <SelectTrigger className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520]">
                  <SelectValue placeholder="Ukuran" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                  {newKriteria.ukuran.map((ukuran) => (
                    <SelectItem
                      key={ukuran.id}
                      value={ukuran.nama}
                      className="text-[#DAA520] hover:bg-[#3d3d3d]">
                      {ukuran.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newRule.kotak}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, kotak: value })
                }>
                <SelectTrigger className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520]">
                  <SelectValue placeholder="Kotak" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                  {newKriteria.kotak.map((kotak) => (
                    <SelectItem
                      key={kotak.id}
                      value={kotak.nama}
                      className="text-[#DAA520] hover:bg-[#3d3d3d]">
                      {kotak.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Modal"
                value={newRule.modal}
                className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520] placeholder:text-gray-500"
                onChange={(e) =>
                  setNewRule({ ...newRule, modal: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Harga"
                value={newRule.harga}
                className="bg-[#3d3d3d] border-[#FFD700] text-[#DAA520] placeholder:text-gray-500"
                onChange={(e) =>
                  setNewRule({ ...newRule, harga: e.target.value })
                }
              />
            </div>
            <Button
              onClick={addRule}
              className="w-full bg-[#FFD700] text-black hover:bg-[#DAA520]">
              Tambah Rule
            </Button>
          </CardContent>
        </Card>

        {/* Tabel Rules */}
        <Card className="bg-[#2d2d2d] border-[#FFD700] border">
          <CardHeader>
            <CardTitle className="text-[#FFD700]">
              Daftar Rules Harga Kue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#FFD700]">
                    <TableHead className="text-[#DAA520]">ID</TableHead>
                    <TableHead className="text-[#DAA520]">Jenis Kue</TableHead>
                    <TableHead className="text-[#DAA520]">Variasi</TableHead>
                    <TableHead className="text-[#DAA520]">Ukuran</TableHead>
                    <TableHead className="text-[#DAA520]">Kotak</TableHead>
                    <TableHead className="text-[#DAA520]">Modal</TableHead>
                    <TableHead className="text-[#DAA520]">Harga</TableHead>
                    <TableHead className="text-[#DAA520] w-16">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow className="border-[#FFD700]">
                      <TableCell
                        colSpan={8}
                        className="text-center text-[#DAA520]">
                        Belum ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow key={rule.id} className="border-[#FFD700]">
                        <TableCell className="text-[#DAA520]">
                          {rule.id}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          {rule.jenis_kue}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          {rule.variasi}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          {rule.ukuran}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          {rule.kotak}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          Rp {parseInt(rule.modal).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[#DAA520]">
                          Rp {parseInt(rule.harga).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRule(rule.id)}
                            className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HargaKue;
