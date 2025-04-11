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

// Warna tema krem/emas
const COLORS = {
  primary: "#D4AF37",      // Emas utama
  secondary: "#C5B358",    // Emas sekunder
  accent: "#E6BE8A",       // Emas terang
  bgColor: "#FAF3E0",      // Krem muda/background utama
  textColor: "#8B7D3F",    // Emas gelap untuk teks
  secondaryTextColor: "#B8A361", // Emas sedang untuk teks sekunder
  cardBgColor: "#FFF8E7",  // Krem sangat muda untuk kartu
  borderColor: "#D4AF37",  // Warna border
  inputBg: "#FFF8E7",      // Background input
};

// Base URL for API
const API = import.meta.env.VITE_API;

const KriteriaTable = ({ data, onDelete }) => (
    <Card className={`bg-${COLORS.cardBgColor} border-${COLORS.borderColor} border`}>
      <CardHeader>
        <CardTitle className={`text-${COLORS.textColor}`}>Daftar Kriteria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={`border-${COLORS.borderColor}`}>
                <TableHead className={`text-${COLORS.textColor}`}>No</TableHead>
                <TableHead className={`text-${COLORS.textColor}`}>Jenis Kue</TableHead>
                <TableHead className={`text-${COLORS.textColor}`}>Variasi Kue</TableHead>
                <TableHead className={`text-${COLORS.textColor}`}>Ukuran Kue</TableHead>
                <TableHead className={`text-${COLORS.textColor}`}>Kotak Kue</TableHead>
                <TableHead className={`text-${COLORS.textColor} w-16`}>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(data).every((arr) => arr.length === 0) ? (
                  <TableRow className={`border-${COLORS.borderColor}`}>
                    <TableCell colSpan={6} className={`text-center text-${COLORS.secondaryTextColor}`}>
                      Belum ada data
                    </TableCell>
                  </TableRow>
              ) : (
                  [
                    ...Array(
                        Math.max(...Object.values(data).map((arr) => arr.length))
                    ),
                  ].map((_, index) => (
                      <TableRow key={index} className={`border-${COLORS.borderColor}`}>
                        <TableCell className={`w-16 text-${COLORS.textColor}`}>
                          {index + 1}
                        </TableCell>
                        <TableCell className={`text-${COLORS.textColor}`}>
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
                        <TableCell className={`text-${COLORS.textColor}`}>
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
                        <TableCell className={`text-${COLORS.textColor}`}>
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
                        <TableCell className={`text-${COLORS.textColor}`}>
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
      const response = await axios.get(`${API}/kriteria`);
      setNewKriteria(response.data);
    } catch (error) {
      console.error("Error fetching kriteria:", error);
      toast.error("Gagal mengambil data kriteria");
    }
  };

  // Fetch all harga kue
  const fetchHargaKue = async () => {
    try {
      const response = await axios.get(`${API}/harga-kue`);
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
        await axios.post(`${API}/kriteria`, {
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
      await axios.delete(`${API}/kriteria/${type}/${id}`);
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
      const response = await axios.post(`${API}/harga-kue`, {
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
      await axios.delete(`${API}/harga-kue/${id}`);
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
      <section className="bg-[#FAF3E0] py-4 px-4 min-h-screen w-full md:py-10 md:px-12 lg:px-20 mt-14">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Bagian Input Kriteria */}
          <Card className="border border-[#D4AF37] bg-[#FFF8E7] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8B7D3F] text-xl md:text-2xl">Tambah Kriteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kriteriaTypes.map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <h3 className="font-medium text-[#8B7D3F]">{label}</h3>
                      <div className="relative">
                        <Input
                            placeholder={`${label} Baru`}
                            className={`bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F] placeholder:text-[#B8A361]/60 ${
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
          <Card className="border border-[#D4AF37] bg-[#FFF8E7] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8B7D3F] text-xl md:text-2xl">Daftar Kriteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#D4AF37]">
                      <TableHead className="text-[#8B7D3F]">No</TableHead>
                      <TableHead className="text-[#8B7D3F]">Jenis Kue</TableHead>
                      <TableHead className="text-[#8B7D3F]">Variasi Kue</TableHead>
                      <TableHead className="text-[#8B7D3F]">Ukuran Kue</TableHead>
                      <TableHead className="text-[#8B7D3F]">Kotak Kue</TableHead>
                      <TableHead className="text-[#8B7D3F] w-16">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(newKriteria).every((arr) => arr.length === 0) ? (
                        <TableRow className="border-[#D4AF37]">
                          <TableCell colSpan={6} className="text-center text-[#B8A361]">
                            Belum ada data
                          </TableCell>
                        </TableRow>
                    ) : (
                        [
                          ...Array(
                              Math.max(...Object.values(newKriteria).map((arr) => arr.length))
                          ),
                        ].map((_, index) => (
                            <TableRow key={index} className="border-[#D4AF37]">
                              <TableCell className="w-16 text-[#8B7D3F]">
                                {index + 1}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {newKriteria.jenisKue[index]?.nama || "-"}
                                {newKriteria.jenisKue[index] && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeKriteria("jenisKue", newKriteria.jenisKue[index].id)
                                        }
                                        className="ml-2 text-red-500 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {newKriteria.variasi[index]?.nama || "-"}
                                {newKriteria.variasi[index] && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeKriteria("variasi", newKriteria.variasi[index].id)
                                        }
                                        className="ml-2 text-red-500 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {newKriteria.ukuran[index]?.nama || "-"}
                                {newKriteria.ukuran[index] && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeKriteria("ukuran", newKriteria.ukuran[index].id)
                                        }
                                        className="ml-2 text-red-500 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {newKriteria.kotak[index]?.nama || "-"}
                                {newKriteria.kotak[index] && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeKriteria("kotak", newKriteria.kotak[index].id)}
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

          {/* Bagian Input Rule */}
          <Card className="border border-[#D4AF37] bg-[#FFF8E7] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8B7D3F] text-xl md:text-2xl">Tambah Rule Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                    value={newRule.jenisKue}
                    onValueChange={(value) =>
                        setNewRule({ ...newRule, jenisKue: value })
                    }>
                  <SelectTrigger className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F]">
                    <SelectValue placeholder="Jenis Kue" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FFF8E7] border-[#D4AF37]">
                    {newKriteria.jenisKue.map((jenis) => (
                        <SelectItem
                            key={jenis.id}
                            value={jenis.nama}
                            className="text-[#8B7D3F] hover:bg-[#FAF3E0]">
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
                  <SelectTrigger className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F]">
                    <SelectValue placeholder="Variasi" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FFF8E7] border-[#D4AF37]">
                    {newKriteria.variasi.map((var_) => (
                        <SelectItem
                            key={var_.id}
                            value={var_.nama}
                            className="text-[#8B7D3F] hover:bg-[#FAF3E0]">
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
                  <SelectTrigger className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F]">
                    <SelectValue placeholder="Ukuran" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FFF8E7] border-[#D4AF37]">
                    {newKriteria.ukuran.map((ukuran) => (
                        <SelectItem
                            key={ukuran.id}
                            value={ukuran.nama}
                            className="text-[#8B7D3F] hover:bg-[#FAF3E0]">
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
                  <SelectTrigger className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F]">
                    <SelectValue placeholder="Kotak" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#FFF8E7] border-[#D4AF37]">
                    {newKriteria.kotak.map((kotak) => (
                        <SelectItem
                            key={kotak.id}
                            value={kotak.nama}
                            className="text-[#8B7D3F] hover:bg-[#FAF3E0]">
                          {kotak.nama}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    type="number"
                    placeholder="Modal"
                    value={newRule.modal}
                    className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F] placeholder:text-[#B8A361]/60"
                    onChange={(e) =>
                        setNewRule({ ...newRule, modal: e.target.value })
                    }
                />

                <Input
                    type="number"
                    placeholder="Harga"
                    value={newRule.harga}
                    className="bg-[#FFF8E7] border-[#D4AF37] text-[#8B7D3F] placeholder:text-[#B8A361]/60"
                    onChange={(e) =>
                        setNewRule({ ...newRule, harga: e.target.value })
                    }
                />
              </div>
              <Button
                  onClick={addRule}
                  className="w-full bg-[#D4AF37] text-[#FFF8E7] hover:bg-[#C5B358]">
                Tambah Rule
              </Button>
            </CardContent>
          </Card>

          {/* Tabel Rules */}
          <Card className="border border-[#D4AF37] bg-[#FFF8E7] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#8B7D3F] text-xl md:text-2xl">
                Daftar Rules Harga Kue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#D4AF37]">
                      <TableHead className="text-[#8B7D3F]">ID</TableHead>
                      <TableHead className="text-[#8B7D3F]">Jenis Kue</TableHead>
                      <TableHead className="text-[#8B7D3F]">Variasi</TableHead>
                      <TableHead className="text-[#8B7D3F]">Ukuran</TableHead>
                      <TableHead className="text-[#8B7D3F]">Kotak</TableHead>
                      <TableHead className="text-[#8B7D3F]">Modal</TableHead>
                      <TableHead className="text-[#8B7D3F]">Harga</TableHead>
                      <TableHead className="text-[#8B7D3F] w-16">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                        <TableRow className="border-[#D4AF37]">
                          <TableCell
                              colSpan={8}
                              className="text-center text-[#B8A361]">
                            Belum ada data
                          </TableCell>
                        </TableRow>
                    ) : (
                        rules.map((rule) => (
                            <TableRow key={rule.id} className="border-[#D4AF37]">
                              <TableCell className="text-[#8B7D3F]">
                                {rule.id}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {rule.jenis_kue}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {rule.variasi}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {rule.ukuran}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                {rule.kotak}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
                                Rp {parseInt(rule.modal).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-[#8B7D3F]">
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