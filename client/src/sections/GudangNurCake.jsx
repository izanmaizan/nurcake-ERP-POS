import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useReactToPrint } from "react-to-print";

const GudangNurCake = () => {
  // Data Dummy
  const dataDummy = {
    persediaan: [
      { id: 1, bahan: "Tepung Terigu", jumlah: 50, satuan: "kg" },
      { id: 2, bahan: "Gula Pasir", jumlah: 30, satuan: "kg" },
      { id: 3, bahan: "Telur", jumlah: 100, satuan: "kg" },
      { id: 4, bahan: "Mentega", jumlah: 25, satuan: "kg" },
      { id: 5, bahan: "Coklat Bubuk", jumlah: 15, satuan: "kg" },
    ],
    kebutuhanBahan: [
      { id: 1, bahan: "Tepung Terigu", jumlah: 60 },
      { id: 2, bahan: "Gula Pasir", jumlah: 45 },
      { id: 3, bahan: "Telur", jumlah: 80 },
      { id: 4, bahan: "Mentega", jumlah: 30 },
      { id: 5, bahan: "Coklat Bubuk", jumlah: 20 },
    ],
    pemasok: [
      { id: 1, nama_pemasok: "PT Tepung Sejahtera", kontak: "0812-3456-7890" },
      { id: 2, nama_pemasok: "UD Manis Jaya", kontak: "0813-5678-9012" },
      { id: 3, nama_pemasok: "CV Telur Berkah", kontak: "0857-1234-5678" },
      { id: 4, nama_pemasok: "PT Mentega Abadi", kontak: "0878-9012-3456" },
      { id: 5, nama_pemasok: "UD Coklat Indah", kontak: "0898-7654-3210" },
    ],
  };

  const [persediaanList, setPersediaanList] = useState(dataDummy.persediaan);
  const [kebutuhanBahan, setKebutuhanBahan] = useState(
    dataDummy.kebutuhanBahan
  );
  const [pemasokList, setPemasokList] = useState(dataDummy.pemasok);
  const [loadingPersediaan, setLoadingPersediaan] = useState(false);
  const [loadingKebutuhan, setLoadingKebutuhan] = useState(false);
  const [loadingPemasok, setLoadingPemasok] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("persediaan");
  const [stokRendah, setStokRendah] = useState([]);

  // State baru untuk edit
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Ref untuk mencetak
  const printRef = useRef();

  // Form states
  const [formData, setFormData] = useState({
    persediaan: { bahan: "", jumlah: "", satuan: "" },
    kebutuhan: { bahan: "", jumlah: "" },
    pemasok: { nama_pemasok: "", kontak: "" },
  });

  useEffect(() => {
    // Cek stok rendah
    const cekStokRendah = persediaanList.filter((item) => {
      const kebutuhan = kebutuhanBahan.find((k) => k.bahan === item.bahan);
      return kebutuhan && item.jumlah < kebutuhan.jumlah;
    });
    setStokRendah(cekStokRendah);
  }, [persediaanList, kebutuhanBahan]);

  // Modifikasi handleSubmit untuk mendukung edit
  const handleSubmit = (e, type) => {
    e.preventDefault();

    if (editMode) {
      // Update existing data
      switch (type) {
        case "persediaan":
          setPersediaanList(
            persediaanList.map((item) =>
              item.id === editId ? { ...formData[type], id: editId } : item
            )
          );
          break;
        case "kebutuhan":
          setKebutuhanBahan(
            kebutuhanBahan.map((item) =>
              item.id === editId ? { ...formData[type], id: editId } : item
            )
          );
          break;
        case "pemasok":
          setPemasokList(
            pemasokList.map((item) =>
              item.id === editId ? { ...formData[type], id: editId } : item
            )
          );
          break;
        default:
          break;
      }
      setEditMode(false);
      setEditId(null);
    } else {
      // Add new data (kode yang sudah ada)
      const newId =
        Math.max(
          ...(type === "persediaan"
            ? persediaanList
            : type === "kebutuhan"
              ? kebutuhanBahan
              : pemasokList
          ).map((item) => item.id)
        ) + 1;

      const newData = { ...formData[type], id: newId };

      switch (type) {
        case "persediaan":
          setPersediaanList([...persediaanList, newData]);
          break;
        case "kebutuhan":
          setKebutuhanBahan([...kebutuhanBahan, newData]);
          break;
        case "pemasok":
          setPemasokList([...pemasokList, newData]);
          break;
        default:
          break;
      }
    }

    // Reset form
    setFormData({
      ...formData,
      [type]:
        type === "persediaan"
          ? { bahan: "", jumlah: "", satuan: "" }
          : type === "kebutuhan"
            ? { bahan: "", jumlah: "" }
            : { nama_pemasok: "", kontak: "" },
    });
  };

  const createDaftarBeli = () => {
    const bahanYangPerluDibeli = kebutuhanBahan.map((kebutuhan) => {
      const persediaan = persediaanList.find(
        (item) => item.bahan === kebutuhan.bahan
      );
      return {
        bahan: kebutuhan.bahan,
        jumlahKebutuhan: kebutuhan.jumlah,
        jumlahTersedia: persediaan ? persediaan.jumlah : 0,
        jumlahBeli: Math.max(
          0,
          kebutuhan.jumlah - (persediaan ? persediaan.jumlah : 0)
        ),
        status:
          persediaan && persediaan.jumlah >= kebutuhan.jumlah
            ? "Cukup"
            : "Perlu Dibeli",
      };
    });
    return bahanYangPerluDibeli.filter((item) => item.jumlahBeli > 0);
  };

  // Fungsi untuk mencetak
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Tunggu sampai konten siap
        if (activeContent.loading) {
          setTimeout(resolve, 500);
        } else {
          resolve();
        }
      });
    },
  });

  // Fungsi untuk mengedit data
  const handleEdit = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setFormData({
      ...formData,
      [activeTab]:
        activeTab === "persediaan"
          ? { bahan: item.bahan, jumlah: item.jumlah, satuan: item.satuan }
          : activeTab === "kebutuhan"
            ? { bahan: item.bahan, jumlah: item.jumlah }
            : { nama_pemasok: item.nama_pemasok, kontak: item.kontak },
    });
  };

  // Fungsi untuk menghapus data
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      switch (activeTab) {
        case "persediaan":
          setPersediaanList(persediaanList.filter((item) => item.id !== id));
          break;
        case "kebutuhan":
          setKebutuhanBahan(kebutuhanBahan.filter((item) => item.id !== id));
          break;
        case "pemasok":
          setPemasokList(pemasokList.filter((item) => item.id !== id));
          break;
        default:
          break;
      }
    }
  };

  const filterData = (data) => {
    return data.filter((item) =>
      Object.values(item).some((val) =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderForm = () => {
    if (activeTab === "pembelian") return null;

    const formFields = {
      persediaan: [
        { name: "bahan", placeholder: "Nama Bahan", type: "text" },
        { name: "jumlah", placeholder: "Jumlah", type: "number" },
        { name: "satuan", placeholder: "Satuan", type: "text" },
      ],
      kebutuhan: [
        { name: "bahan", placeholder: "Nama Bahan", type: "text" },
        { name: "jumlah", placeholder: "Jumlah", type: "number" },
      ],
      pemasok: [
        { name: "nama_pemasok", placeholder: "Nama Pemasok", type: "text" },
        { name: "kontak", placeholder: "Kontak", type: "text" },
      ],
    };

    const fields = formFields[activeTab];
    if (!fields) return null;

    return (
      <form
        onSubmit={(e) => handleSubmit(e, activeTab)}
        className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#155E75]">
          {editMode ? "Edit" : "Tambah"}{" "}
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h3>
        <div className={`grid grid-cols-1 md:grid-cols-${fields.length} gap-4`}>
          {fields.map((field) => (
            <input
              key={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[activeTab][field.name]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [activeTab]: {
                    ...formData[activeTab],
                    [field.name]: e.target.value,
                  },
                })
              }
              className="border rounded-lg px-4 py-2"
              required
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-[#155E75] text-white px-4 py-2 rounded-lg hover:bg-[#0e4356] transition-colors flex items-center gap-2">
            {editMode ? (
              <Pencil className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            {editMode ? "Simpan" : "Tambah"}{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setEditId(null);
                setFormData({
                  ...formData,
                  [activeTab]:
                    activeTab === "persediaan"
                      ? { bahan: "", jumlah: "", satuan: "" }
                      : activeTab === "kebutuhan"
                        ? { bahan: "", jumlah: "" }
                        : { nama_pemasok: "", kontak: "" },
                });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Batal
            </button>
          )}
        </div>
      </form>
    );
  };

  const renderTabs = () => (
    <div className="flex space-x-4 mb-6">
      {["persediaan", "kebutuhan", "pemasok", "pembelian"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${
              activeTab === tab
                ? "bg-[#155E75] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    const content = {
      persediaan: {
        title: "Persediaan Bahan Baku",
        loading: loadingPersediaan,
        data: filterData(persediaanList),
        columns: ["Bahan", "Jumlah", "Satuan"],
      },
      kebutuhan: {
        title: "Kebutuhan Bahan untuk Pesanan",
        loading: loadingKebutuhan,
        data: filterData(kebutuhanBahan),
        columns: ["Bahan", "Jumlah"],
      },
      pemasok: {
        title: "Pemasok Bahan Baku",
        loading: loadingPemasok,
        data: filterData(pemasokList),
        columns: ["Nama Pemasok", "Kontak"],
      },
      pembelian: {
        title: "Daftar Bahan yang Perlu Dibeli",
        loading: loadingKebutuhan || loadingPersediaan,
        data: filterData(createDaftarBeli()),
        columns: [
          "Bahan",
          "Jumlah Kebutuhan",
          "Jumlah Tersedia",
          "Jumlah Dibeli",
          "Status",
        ],
      },
    };

    const activeContent = content[activeTab];

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#155E75]">
            {activeContent.title}
          </h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155E75]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-[#155E75] text-white">
              <tr>
                {activeContent.columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-left">
                    {column}
                  </th>
                ))}
                {activeTab !== "pembelian" && (
                  <th className="px-4 py-3 text-right print:hidden">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {activeContent.data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-[#e1f5f9] transition-colors">
                  {Object.keys(item)
                    .filter((key) => key !== "id")
                    .map((key, i) => (
                      <td key={i} className="px-4 py-3 border-t">
                        {item[key]}
                      </td>
                    ))}
                  {activeTab !== "pembelian" && (
                    <td className="px-4 py-3 border-t text-right print:hidden">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 mx-2"
                        title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 mx-2"
                        title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-gray-100 py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="max-w-7xl mx-auto" ref={printRef}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#155E75]">
            Manajemen Gudang NurCake
          </h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stokRendah.length > 0 && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              Terdapat {stokRendah.length} bahan dengan stok di bawah kebutuhan
            </AlertDescription>
          </Alert>
        )}

        {renderTabs()}
        {renderForm()}
        {renderContent()}
      </div>
    </section>
  );
};

export default GudangNurCake;
