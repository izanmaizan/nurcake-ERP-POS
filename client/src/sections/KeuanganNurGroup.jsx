import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Filter,
  PieChart as PieChartIcon,
  RefreshCcw,
  Printer,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const KeuanganNurGroup = () => {
  const [transaksiNC, setTransaksiNC] = useState([]);
  const [transaksiNBA, setTransaksiNBA] = useState([]);
  const [bookingNMUA, setBookingNMUA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const [profitTarget, setProfitTarget] = useState({
    NC: 100000,
    NBA: 3000000,
    NMUA: 5000000,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    fetchData();
  }, [timeRange, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ncResponse = await fetch("http://localhost:3000/transaksi-nc");
      const nbaResponse = await fetch("http://localhost:3000/transaksi-nba");
      const nmuaResponse = await fetch("http://localhost:3000/booking");

      const [ncData, nbaData, nmuaData] = await Promise.all([
        ncResponse.json(),
        nbaResponse.json(),
        nmuaResponse.json(),
      ]);

      // Filter data berdasarkan range waktu yang dipilih
      const filteredData = filterDataByTimeRange({
        ncData,
        nbaData,
        nmuaData,
      });

      setTransaksiNC(filteredData.ncData);
      setTransaksiNBA(filteredData.nbaData);
      setBookingNMUA(filteredData.nmuaData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal mengambil data. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const filterDataByTimeRange = ({ ncData, nbaData, nmuaData }) => {
    const filterByDate = (data) => {
      if (!dateRange.startDate || !dateRange.endDate) {
        return data;
      }

      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      return data.filter((item) => {
        const itemDate = new Date(item.tanggal);
        return itemDate >= startDate && itemDate <= endDate;
      });
    };

    const filterByBusiness = (data) => {
      if (selectedBusiness === "all") return data;
      return data;
    };

    const filterByTimePreset = (data) => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (timeRange) {
        case "today":
          return data.filter((item) => {
            const itemDate = new Date(item.tanggal);
            return itemDate >= today && itemDate <= now;
          });
        case "week":
          const lastWeek = new Date(now);
          lastWeek.setDate(lastWeek.getDate() - 7);
          lastWeek.setHours(0, 0, 0, 0);
          return data.filter((item) => {
            const itemDate = new Date(item.tanggal);
            return itemDate >= lastWeek && itemDate <= now;
          });
        case "month":
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          lastMonth.setHours(0, 0, 0, 0);
          return data.filter((item) => {
            const itemDate = new Date(item.tanggal);
            return itemDate >= lastMonth && itemDate <= now;
          });
        default:
          return data;
      }
    };

    const filteredNC = filterByTimePreset(
      filterByDate(filterByBusiness(ncData))
    );
    const filteredNBA = filterByTimePreset(
      filterByDate(filterByBusiness(nbaData))
    );
    const filteredNMUA = filterByTimePreset(
      filterByDate(filterByBusiness(nmuaData))
    );

    return {
      ncData: filteredNC,
      nbaData: filteredNBA,
      nmuaData: filteredNMUA,
    };
  };

  const calculateBusinessMetrics = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        pendapatan: 0,
        modal: 0,
        laba: 0,
        jumlahTransaksi: 0,
        profitMargin: 0,
        targetAchievement: 0,
      };
    }

    try {
      const baseCalculation = {
        NC: () =>
          data.reduce(
            (acc, curr) => {
              const items = JSON.parse(
                typeof curr.items === "string"
                  ? curr.items
                  : JSON.stringify(curr.items)
              );
              const totalModal = Array.isArray(items)
                ? items.reduce(
                    (sum, item) => sum + (Number(item.total_modal) || 0),
                    0
                  )
                : 0;
              const pendapatan =
                acc.pendapatan + (Number(curr.total_harga) || 0);
              const modal = acc.modal + totalModal;
              return {
                pendapatan,
                modal,
                laba: pendapatan - modal,
                jumlahTransaksi: acc.jumlahTransaksi + 1,
              };
            },
            { pendapatan: 0, modal: 0, laba: 0, jumlahTransaksi: 0 }
          ),
        NBA: () =>
          data.reduce(
            (acc, curr) => {
              const pendapatan =
                acc.pendapatan + (Number(curr.total_harga) || 0);
              const modal =
                acc.modal +
                (Number(curr.modal_pembuatan) || 0) *
                  (Number(curr.jumlah) || 1);
              return {
                pendapatan,
                modal,
                laba: pendapatan - modal,
                jumlahTransaksi: acc.jumlahTransaksi + 1,
              };
            },
            { pendapatan: 0, modal: 0, laba: 0, jumlahTransaksi: 0 }
          ),
        NMUA: () =>
          data.reduce(
            (acc, curr) => {
              const pendapatan =
                acc.pendapatan + (Number(curr.total_harga) || 0);
              const modal = acc.modal + (Number(curr.kisaran_modal) || 0);
              return {
                pendapatan,
                modal,
                laba: pendapatan - modal,
                jumlahTransaksi: acc.jumlahTransaksi + 1,
              };
            },
            { pendapatan: 0, modal: 0, laba: 0, jumlahTransaksi: 0 }
          ),
      };

      const result = baseCalculation[type]();

      // Cek untuk menghindari division by zero dan memastikan hasilnya valid
      const profitMargin =
        result.pendapatan > 0
          ? ((result.laba / result.pendapatan) * 100).toFixed(2)
          : "0";

      const targetAchievement =
        profitTarget[type] > 0
          ? ((result.laba / profitTarget[type]) * 100).toFixed(2)
          : "0";

      return {
        ...result,
        profitMargin,
        targetAchievement,
      };
    } catch (error) {
      console.error(`Error calculating metrics for ${type}:`, error);
      return {
        pendapatan: 0,
        modal: 0,
        laba: 0,
        jumlahTransaksi: 0,
        profitMargin: "0",
        targetAchievement: "0",
      };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getChartData = () => {
    const ncMetrics = calculateBusinessMetrics(transaksiNC, "NC");
    const nbaMetrics = calculateBusinessMetrics(transaksiNBA, "NBA");
    const nmuaMetrics = calculateBusinessMetrics(bookingNMUA, "NMUA");

    // Pastikan pendapatan tidak nol untuk menghindari division by zero
    const ncProfitMargin =
      ncMetrics.pendapatan > 0
        ? Number(((ncMetrics.laba / ncMetrics.pendapatan) * 100).toFixed(2))
        : 0;

    const nbaProfitMargin =
      nbaMetrics.pendapatan > 0
        ? Number(((nbaMetrics.laba / nbaMetrics.pendapatan) * 100).toFixed(2))
        : 0;

    const nmuaProfitMargin =
      nmuaMetrics.pendapatan > 0
        ? Number(((nmuaMetrics.laba / nmuaMetrics.pendapatan) * 100).toFixed(2))
        : 0;

    return [
      {
        name: "Nur Cake",
        pendapatan: ncMetrics.pendapatan,
        modal: ncMetrics.modal,
        laba: ncMetrics.laba,
        profitMargin: ncProfitMargin,
      },
      {
        name: "Nur Bouquet",
        pendapatan: nbaMetrics.pendapatan,
        modal: nbaMetrics.modal,
        laba: nbaMetrics.laba,
        profitMargin: nbaProfitMargin,
      },
      {
        name: "Nur MUA",
        pendapatan: nmuaMetrics.pendapatan,
        modal: nmuaMetrics.modal,
        laba: nmuaMetrics.laba,
        profitMargin: nmuaProfitMargin,
      },
    ];
  };

  const exportToExcel = async () => {
    const totalMetrics = {
      nc: calculateBusinessMetrics(transaksiNC, "NC"),
      nba: calculateBusinessMetrics(transaksiNBA, "NBA"),
      nmua: calculateBusinessMetrics(bookingNMUA, "NMUA"),
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Nur Group";
    workbook.created = new Date();

    // Buat worksheet ringkasan
    const wsSummary = workbook.addWorksheet("Ringkasan");

    // Styling untuk header
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "155E75" } },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "medium" },
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
      },
    };

    // Styling untuk data
    const dataStyle = {
      alignment: { horizontal: "left", vertical: "middle" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Set lebar kolom ringkasan
    wsSummary.columns = [
      { width: 15 },
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    // Tambahkan data ringkasan
    wsSummary.addRow(["LAPORAN KEUANGAN NUR GROUP"]).font = {
      bold: true,
      size: 14,
    };
    wsSummary.addRow(["Periode:", getPeriodeText()]);
    wsSummary.addRow(["Tanggal Cetak:", new Date().toLocaleString("id-ID")]);
    wsSummary.addRow([]);

    // Fungsi helper untuk format items
    const formatItems = (items) => {
      try {
        const parsedItems =
          typeof items === "string" ? JSON.parse(items) : items;
        if (!Array.isArray(parsedItems)) return "";

        return parsedItems
          .map((item) => {
            if (item.tipe === "custom_cake") {
              const tambahan =
                item.biaya_tambahan
                  ?.map(
                    (t) => `${t.nama_item}(${t.jumlah_item}x@${t.harga_item})`
                  )
                  .join(", ") || "";

              return `Custom Cake: ${item.jenis_kue} | ${item.variasi_kue} | ${item.ukuran_kue} | Kotak: ${item.kotak_kue} | Jumlah: ${item.jumlah_pesanan} | Modal: ${item.modal} | Harga: ${item.harga_jual} | Tambahan: ${tambahan}`;
            } else if (item.tipe === "kue_ready") {
              return `Kue Ready: ${item.nama_kue} | ${item.jenis_kue} | Jumlah: ${item.jumlah} | Modal: ${item.modal_pembuatan} | Harga: ${item.harga_jual}`;
            } else if (item.tipe === "produk_reguler") {
              return `Produk: ${item.nama_produk} | Jumlah: ${item.jumlah} | Modal: ${item.modal_produk} | Harga: ${item.harga_jual}`;
            }
            return JSON.stringify(item);
          })
          .join("\n");
      } catch (error) {
        console.error("Error formatting items:", error);
        return "";
      }
    };

    // Fungsi helper untuk format additional items
    const formatAdditionalItems = (items) => {
      try {
        const parsedItems =
          typeof items === "string" ? JSON.parse(items) : items;
        if (!Array.isArray(parsedItems)) return "";
        return parsedItems
          .map((item) => `${item.nama}(${item.jumlah}x@${item.harga})`)
          .join(", ");
      } catch (error) {
        console.error("Error formatting additional items:", error);
        return "";
      }
    };

    // Fungsi untuk membuat worksheet transaksi utama
    const createTransactionSheet = (data, sheetName) => {
      const ws = workbook.addWorksheet(sheetName);

      ws.columns = [
        { header: "ID Transaksi", key: "id_transaksi", width: 15 },
        { header: "Tanggal Transaksi", key: "tanggal_transaksi", width: 20 },
        {
          header: "Tanggal Pengambilan",
          key: "tanggal_pengambilan",
          width: 20,
        },
        { header: "Waktu Pengambilan", key: "waktu_pengambilan", width: 15 },
        { header: "Total Harga", key: "total_harga", width: 15 },
        { header: "Metode Pembayaran", key: "metode_pembayaran", width: 20 },
        { header: "Jumlah Dibayar", key: "jumlah_dibayar", width: 15 },
        { header: "Status Pembayaran", key: "status_pembayaran", width: 15 },
        { header: "Atas Nama", key: "atas_nama", width: 20 },
        { header: "Catatan", key: "catatan", width: 30 },
        { header: "Status", key: "status_kue", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      // Styling header
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "155E75" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Tambah data
      data.forEach((row) => {
        ws.addRow({
          ...row,
          tanggal_transaksi: new Date(row.tanggal_transaksi).toLocaleString(
            "id-ID"
          ),
          tanggal_pengambilan: new Date(row.tanggal_pengambilan).toLocaleString(
            "id-ID"
          ),
          created_at: new Date(row.created_at).toLocaleString("id-ID"),
          total_harga: Number(row.total_harga),
          jumlah_dibayar: Number(row.jumlah_dibayar),
        });
      });

      // Format kolom
      ws.getColumn("total_harga").numFmt = "#,##0.00";
      ws.getColumn("jumlah_dibayar").numFmt = "#,##0.00";
    };

    // Fungsi untuk membuat worksheet items
    const createItemsSheet = (data, sheetName) => {
      const ws = workbook.addWorksheet(`${sheetName} Items`);

      ws.columns = [
        { header: "ID Transaksi", key: "id_transaksi", width: 15 },
        { header: "Tipe Item", key: "tipe", width: 15 },
        { header: "Nama Item", key: "nama_item", width: 30 },
        { header: "Jenis", key: "jenis", width: 20 },
        { header: "Variasi", key: "variasi", width: 20 },
        { header: "Ukuran", key: "ukuran", width: 15 },
        { header: "Jumlah", key: "jumlah", width: 10 },
        { header: "Modal", key: "modal", width: 15 },
        { header: "Harga Jual", key: "harga_jual", width: 15 },
        { header: "Total Modal", key: "total_modal", width: 15 },
        { header: "Total Harga", key: "total_harga", width: 15 },
      ];

      // Styling header
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "155E75" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Proses dan tambah data items
      data.forEach((transaction) => {
        try {
          const items =
            typeof transaction.items === "string"
              ? JSON.parse(transaction.items)
              : transaction.items;

          if (Array.isArray(items)) {
            items.forEach((item) => {
              const row = {
                id_transaksi: transaction.id_transaksi,
                tipe: item.tipe,
                nama_item: item.nama_kue || item.nama_produk || item.jenis_kue,
                jenis: item.jenis_kue || "-",
                variasi: item.variasi_kue || "-",
                ukuran: item.ukuran_kue || "-",
                jumlah: item.jumlah || item.jumlah_pesanan || 1,
                modal:
                  item.modal || item.modal_pembuatan || item.modal_produk || 0,
                harga_jual: item.harga_jual || 0,
                total_modal: item.total_modal || 0,
                total_harga: item.total_harga || 0,
              };
              ws.addRow(row);
            });
          }
        } catch (error) {
          console.error(
            `Error processing items for transaction ${transaction.id_transaksi}:`,
            error
          );
        }
      });

      // Format kolom numerik
      ["modal", "harga_jual", "total_modal", "total_harga"].forEach((col) => {
        ws.getColumn(col).numFmt = "#,##0.00";
      });
    };

    // Fungsi untuk membuat worksheet additional items
    const createAdditionalItemsSheet = (data, sheetName) => {
      const ws = workbook.addWorksheet(`${sheetName} Additional`);

      ws.columns = [
        { header: "ID Transaksi", key: "id_transaksi", width: 15 },
        { header: "Nama Item", key: "nama", width: 30 },
        { header: "Jumlah", key: "jumlah", width: 10 },
        { header: "Harga", key: "harga", width: 15 },
        { header: "Total", key: "total", width: 15 },
      ];

      // Styling header
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "155E75" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Proses dan tambah data additional items
      data.forEach((transaction) => {
        try {
          const additionalItems =
            typeof transaction.additional_items === "string"
              ? JSON.parse(transaction.additional_items)
              : transaction.additional_items;

          if (Array.isArray(additionalItems)) {
            additionalItems.forEach((item) => {
              const row = {
                id_transaksi: transaction.id_transaksi,
                nama: item.nama,
                jumlah: item.jumlah,
                harga: item.harga,
                total: item.jumlah * item.harga,
              };
              ws.addRow(row);
            });
          }
        } catch (error) {
          console.error(
            `Error processing additional items for transaction ${transaction.id_transaksi}:`,
            error
          );
        }
      });

      // Format kolom numerik
      ["harga", "total"].forEach((col) => {
        ws.getColumn(col).numFmt = "#,##0.00";
      });
    };

    // Tambahkan ringkasan keuangan grup
    wsSummary.addRow(["RINGKASAN KEUANGAN GRUP"]).font = { bold: true };

    const summaryHeaders = ["Metrik", "Nilai", "% dari Total"];
    const summaryHeaderRow = wsSummary.addRow(summaryHeaders);
    summaryHeaderRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Data ringkasan
    const summaryData = [
      ["Total Pendapatan", grandTotal.pendapatan, "100%"],
      [
        "Total Modal",
        grandTotal.modal,
        `${((grandTotal.modal / grandTotal.pendapatan) * 100).toFixed(2)}%`,
      ],
      [
        "Total Laba",
        grandTotal.laba,
        `${((grandTotal.laba / grandTotal.pendapatan) * 100).toFixed(2)}%`,
      ],
      ["Total Transaksi", grandTotal.jumlahTransaksi, ""],
    ];

    summaryData.forEach((row) => {
      const dataRow = wsSummary.addRow(row);
      dataRow.eachCell((cell) => {
        cell.style = dataStyle;
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    wsSummary.addRow([]);

    // Tambahkan performa per bisnis
    wsSummary.addRow(["PERFORMA PER BISNIS"]).font = { bold: true };

    const businessHeaders = ["Metrik", "Nur Cake", "Nur Bouquet", "Nur MUA"];
    const businessHeaderRow = wsSummary.addRow(businessHeaders);
    businessHeaderRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    const businessData = [
      [
        "Pendapatan",
        totalMetrics.nc.pendapatan,
        totalMetrics.nba.pendapatan,
        totalMetrics.nmua.pendapatan,
      ],
      [
        "Modal",
        totalMetrics.nc.modal,
        totalMetrics.nba.modal,
        totalMetrics.nmua.modal,
      ],
      [
        "Laba",
        totalMetrics.nc.laba,
        totalMetrics.nba.laba,
        totalMetrics.nmua.laba,
      ],
      [
        "Profit Margin",
        `${totalMetrics.nc.profitMargin}%`,
        `${totalMetrics.nba.profitMargin}%`,
        `${totalMetrics.nmua.profitMargin}%`,
      ],
      [
        "Target Pencapaian",
        `${totalMetrics.nc.targetAchievement}%`,
        `${totalMetrics.nba.targetAchievement}%`,
        `${totalMetrics.nmua.targetAchievement}%`,
      ],
    ];

    businessData.forEach((row) => {
      const dataRow = wsSummary.addRow(row);
      dataRow.eachCell((cell, colNumber) => {
        cell.style = dataStyle;
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    // Fungsi untuk membuat worksheet bisnis dengan data gabungan untuk Nur Cake
    const createBusinessSheet = (data, sheetName) => {
      const ws = workbook.addWorksheet(sheetName);

      // Definisi kolom untuk transaksi
      const transactionColumns = [
        { header: "ID Transaksi", key: "id_transaksi", width: 15 },
        { header: "Tanggal Transaksi", key: "tanggal_transaksi", width: 20 },
        {
          header: "Tanggal Pengambilan",
          key: "tanggal_pengambilan",
          width: 20,
        },
        { header: "Waktu Pengambilan", key: "waktu_pengambilan", width: 15 },
        { header: "Total Harga", key: "total_harga", width: 15 },
        { header: "Metode Pembayaran", key: "metode_pembayaran", width: 20 },
        { header: "Jumlah Dibayar", key: "jumlah_dibayar", width: 15 },
        { header: "Status Pembayaran", key: "status_pembayaran", width: 15 },
        { header: "Atas Nama", key: "atas_nama", width: 20 },
        { header: "Catatan", key: "catatan", width: 30 },
        { header: "Status", key: "status_kue", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      // Set kolom untuk transaksi
      ws.columns = transactionColumns;

      // Header style
      const headerStyle = {
        font: { bold: true, color: { argb: "FFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "155E75" },
        },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "medium" },
        },
      };

      // Styling header transaksi
      const headerRow = ws.getRow(1);
      transactionColumns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.style = headerStyle;
      });

      // Tambah data transaksi
      data.forEach((row) => {
        ws.addRow({
          id_transaksi: row.id_transaksi,
          tanggal_transaksi: new Date(row.tanggal_transaksi).toLocaleString(
            "id-ID"
          ),
          tanggal_pengambilan: new Date(row.tanggal_pengambilan).toLocaleString(
            "id-ID"
          ),
          waktu_pengambilan: row.waktu_pengambilan,
          total_harga: Number(row.total_harga),
          metode_pembayaran: row.metode_pembayaran,
          jumlah_dibayar: Number(row.jumlah_dibayar),
          status_pembayaran: row.status_pembayaran,
          atas_nama: row.atas_nama,
          catatan: row.catatan,
          status_kue: row.status_kue,
          created_at: new Date(row.created_at).toLocaleString("id-ID"),
        });
      });

      // Format numerik untuk transaksi
      ws.getColumn("total_harga").numFmt = "#,##0.00";
      ws.getColumn("jumlah_dibayar").numFmt = "#,##0.00";

      // Khusus untuk Nur Cake, tambahkan section Items dan Additional Items
      if (sheetName === "Nur Cake") {
        // Tambah spasi sebelum section Items
        const lastRow = ws.lastRow?.number || 0;
        ws.addRow([]);
        ws.addRow([]);

        // Header untuk Items section
        const itemsStartRow = lastRow + 3;
        const itemsHeaderRow = ws.addRow(["DETAIL ITEMS"]);
        itemsHeaderRow.getCell(1).font = { bold: true, size: 12 };

        // Kolom untuk Items
        const itemsColumns = [
          "ID Transaksi",
          "Tipe Item",
          "Nama Item",
          "Jenis",
          "Variasi",
          "Ukuran",
          "Jumlah",
          "Modal",
          "Harga Jual",
          "Total Modal",
          "Total Harga",
        ];

        // Tambah header Items
        const itemsHeader = ws.addRow(itemsColumns);
        itemsColumns.forEach((_, index) => {
          const cell = itemsHeader.getCell(index + 1);
          cell.style = headerStyle;
        });

        // Tambah data items
        data.forEach((transaction) => {
          try {
            const items =
              typeof transaction.items === "string"
                ? JSON.parse(transaction.items)
                : transaction.items;
            if (Array.isArray(items)) {
              items.forEach((item) => {
                const itemRow = ws.addRow([
                  transaction.id_transaksi,
                  item.tipe,
                  item.nama_kue || item.nama_produk || item.jenis_kue,
                  item.jenis_kue || "-",
                  item.variasi_kue || "-",
                  item.ukuran_kue || "-",
                  item.jumlah || item.jumlah_pesanan || 1,
                  item.modal || item.modal_pembuatan || item.modal_produk || 0,
                  item.harga_jual || 0,
                  item.total_modal || 0,
                  item.total_harga || 0,
                ]);
              });
            }
          } catch (error) {
            console.error(
              `Error processing items for transaction ${transaction.id_transaksi}:`,
              error
            );
          }
        });

        // Tambah spasi sebelum Additional Items
        ws.addRow([]);
        ws.addRow([]);

        // Header untuk Additional Items section
        const additionalHeaderRow = ws.addRow(["ADDITIONAL ITEMS"]);
        additionalHeaderRow.getCell(1).font = { bold: true, size: 12 };

        // Kolom untuk Additional Items
        const additionalColumns = [
          "ID Transaksi",
          "Nama Item",
          "Jumlah",
          "Harga",
          "Total",
        ];

        // Tambah header Additional Items
        const additionalHeader = ws.addRow(additionalColumns);
        additionalColumns.forEach((_, index) => {
          const cell = additionalHeader.getCell(index + 1);
          cell.style = headerStyle;
        });

        // Tambah data additional items
        data.forEach((transaction) => {
          try {
            const additionalItems =
              typeof transaction.additional_items === "string"
                ? JSON.parse(transaction.additional_items)
                : transaction.additional_items;

            if (Array.isArray(additionalItems)) {
              additionalItems.forEach((item) => {
                const additionalRow = ws.addRow([
                  transaction.id_transaksi,
                  item.nama,
                  item.jumlah,
                  item.harga,
                  item.jumlah * item.harga,
                ]);
              });
            }
          } catch (error) {
            console.error(
              `Error processing additional items for transaction ${transaction.id_transaksi}:`,
              error
            );
          }
        });
      }

      // Auto-fit kolom berdasarkan konten
      ws.columns.forEach((column) => {
        column.width = Math.max(column.width || 10, 15);
      });
    };

    createBusinessSheet(transaksiNC, "Nur Cake");
    createBusinessSheet(transaksiNBA, "Nur Bouquet");
    createBusinessSheet(bookingNMUA, "Nur MUA");

    // Buat worksheet untuk setiap bisnis
    // Buat worksheet untuk setiap bisnis dengan kondisi khusus untuk Nur Cake
    ["Nur Cake", "Nur Bouquet", "Nur MUA"].forEach((business) => {
      const data =
        business === "Nur Cake"
          ? transaksiNC
          : business === "Nur Bouquet"
            ? transaksiNBA
            : bookingNMUA;

      // Selalu buat sheet transaksi untuk semua bisnis
      createTransactionSheet(data, `${business} Transaksi`);

      // Buat items dan additional items sheet hanya untuk Nur Cake
      if (business === "Nur Cake") {
        createItemsSheet(data, business);
        createAdditionalItemsSheet(data, business);
      }
    });

    // Generate dan download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `Laporan_Keuangan_NurGroup_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Helper function untuk mendapatkan teks periode
  const getPeriodeText = () => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${new Date(dateRange.startDate).toLocaleDateString("id-ID")} - ${new Date(dateRange.endDate).toLocaleDateString("id-ID")}`;
    }

    switch (timeRange) {
      case "today":
        return "Hari Ini";
      case "week":
        return "7 Hari Terakhir";
      case "month":
        return "30 Hari Terakhir";
      default:
        return "Semua Waktu";
    }
  };

  // Helper function untuk menghitung total modal items NC
  const calculateNCItemsModal = (transaction) => {
    try {
      const items = JSON.parse(
        typeof transaction.items === "string"
          ? transaction.items
          : JSON.stringify(transaction.items)
      );
      return Array.isArray(items)
        ? items.reduce((sum, item) => sum + (Number(item.total_modal) || 0), 0)
        : 0;
    } catch (error) {
      console.error("Error calculating NC items modal:", error);
      return 0;
    }
  };

  // Fungsi untuk mencetak PDF yang ditingkatkan
  const generatePDF = () => {
    const doc = new jsPDF();
    const totalMetrics = {
      nc: calculateBusinessMetrics(transaksiNC, "NC"),
      nba: calculateBusinessMetrics(transaksiNBA, "NBA"),
      nmua: calculateBusinessMetrics(bookingNMUA, "NMUA"),
    };

    // Helper function untuk format tanggal
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // Helper function untuk format items
    const formatItems = (items) => {
      try {
        const parsedItems =
          typeof items === "string" ? JSON.parse(items) : items;
        if (!Array.isArray(parsedItems)) return "";

        return parsedItems
          .map((item) => {
            if (item.tipe === "custom_cake") {
              return `Custom Cake: ${item.jenis_kue} - ${item.variasi_kue} (${
                item.ukuran_kue
              }) x${item.jumlah_pesanan || 1} = ${formatCurrency(
                item.total_harga || 0
              )}`;
            } else if (item.tipe === "kue_ready") {
              return `Kue Ready: ${item.nama_kue} x${item.jumlah || 1} = ${formatCurrency(
                item.total_harga || 0
              )}`;
            } else if (item.tipe === "produk_reguler") {
              return `Produk: ${item.nama_produk} x${item.jumlah || 1} = ${formatCurrency(
                item.total_harga || 0
              )}`;
            }
            return JSON.stringify(item);
          })
          .join("\n");
      } catch (error) {
        console.error("Error formatting items:", error);
        return "";
      }
    };

    // Helper function untuk format additional items
    const formatAdditionalItems = (items) => {
      try {
        const parsedItems =
          typeof items === "string" ? JSON.parse(items) : items;
        if (!Array.isArray(parsedItems)) return "";

        return parsedItems
          .map(
            (item) =>
              `${item.nama} x${item.jumlah} = ${formatCurrency(
                (item.jumlah || 0) * (item.harga || 0)
              )}`
          )
          .join("\n");
      } catch (error) {
        console.error("Error formatting additional items:", error);
        return "";
      }
    };

    // --- HALAMAN 1: LAPORAN UTAMA ---
    doc.setFont("times", "normal");

    // Header
    doc.setFontSize(24);
    doc.setTextColor(21, 94, 117); // #155E75
    doc.text("NUR GROUP", 105, 20, { align: "center" });

    doc.setFontSize(18);
    doc.text("Laporan Keuangan", 105, 30, { align: "center" });

    // Informasi Laporan
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Periode: ${getPeriodeText()}`, 20, 45);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      20,
      52
    );

    // Ringkasan Keuangan Grup
    doc.setFontSize(14);
    doc.setTextColor(21, 94, 117);
    doc.text("Ringkasan Keuangan Grup", 20, 70);

    // Tabel Ringkasan
    doc.autoTable({
      startY: 75,
      head: [["Metrik", "Nilai", "% dari Total"]],
      body: [
        ["Total Pendapatan", formatCurrency(grandTotal.pendapatan), "100%"],
        [
          "Total Modal",
          formatCurrency(grandTotal.modal),
          `${((grandTotal.modal / grandTotal.pendapatan) * 100).toFixed(2)}%`,
        ],
        [
          "Total Laba",
          formatCurrency(grandTotal.laba),
          `${((grandTotal.laba / grandTotal.pendapatan) * 100).toFixed(2)}%`,
        ],
        ["Total Transaksi", grandTotal.jumlahTransaksi.toString(), "-"],
      ],
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Performa Per Bisnis
    doc.text("Performa Per Bisnis", 20, doc.previousAutoTable.finalY + 15);

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [["Metrik", "Nur Cake", "Nur Bouquet", "Nur MUA"]],
      body: [
        [
          "Pendapatan",
          formatCurrency(totalMetrics.nc.pendapatan),
          formatCurrency(totalMetrics.nba.pendapatan),
          formatCurrency(totalMetrics.nmua.pendapatan),
        ],
        [
          "Modal",
          formatCurrency(totalMetrics.nc.modal),
          formatCurrency(totalMetrics.nba.modal),
          formatCurrency(totalMetrics.nmua.modal),
        ],
        [
          "Laba",
          formatCurrency(totalMetrics.nc.laba),
          formatCurrency(totalMetrics.nba.laba),
          formatCurrency(totalMetrics.nmua.laba),
        ],
        [
          "Profit Margin",
          `${totalMetrics.nc.profitMargin}%`,
          `${totalMetrics.nba.profitMargin}%`,
          `${totalMetrics.nmua.profitMargin}%`,
        ],
        [
          "Target Pencapaian",
          `${totalMetrics.nc.targetAchievement}%`,
          `${totalMetrics.nba.targetAchievement}%`,
          `${totalMetrics.nmua.targetAchievement}%`,
        ],
      ],
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Tanda Tangan
    const signatureY = doc.previousAutoTable.finalY + 40;
    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.text("Disetujui oleh:", 170, signatureY, { align: "center" });
    doc.line(150, signatureY + 25, 190, signatureY + 25);
    doc.text("Admin Utama", 170, signatureY + 30, { align: "center" });
    doc.text("(________________)", 170, signatureY + 35, { align: "center" });

    // --- HALAMAN 2: NUR CAKE ---
    doc.addPage();

    // Header Nur Cake
    doc.setFontSize(18);
    doc.setTextColor(21, 94, 117);
    doc.text("Detail Transaksi - Nur Cake", 105, 20, { align: "center" });

    // Ringkasan Nur Cake
    doc.autoTable({
      startY: 30,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Pendapatan", formatCurrency(totalMetrics.nc.pendapatan)],
        ["Total Modal", formatCurrency(totalMetrics.nc.modal)],
        ["Total Laba", formatCurrency(totalMetrics.nc.laba)],
        ["Jumlah Transaksi", totalMetrics.nc.jumlahTransaksi.toString()],
        ["Profit Margin", `${totalMetrics.nc.profitMargin}%`],
        ["Target Pencapaian", `${totalMetrics.nc.targetAchievement}%`],
      ],
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Detail Transaksi Nur Cake
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 10,
      head: [
        [
          "Tanggal",
          "Atas Nama",
          "Items",
          "Additional Items",
          "Total",
          "Status",
        ],
      ],
      body: transaksiNC.map((t) => [
        formatDate(t.tanggal_transaksi),
        t.atas_nama,
        formatItems(t.items),
        formatAdditionalItems(t.additional_items),
        formatCurrency(t.total_harga),
        t.status_pembayaran,
      ]),
      styles: { fontSize: 8, font: "times", cellPadding: 2 },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 50 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });

    // --- HALAMAN 3: NUR BOUQUET ---
    doc.addPage();

    // Header Nur Bouquet
    doc.setFontSize(18);
    doc.setTextColor(21, 94, 117);
    doc.text("Detail Transaksi - Nur Bouquet", 105, 20, { align: "center" });

    // Ringkasan Nur Bouquet
    doc.autoTable({
      startY: 30,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Pendapatan", formatCurrency(totalMetrics.nba.pendapatan)],
        ["Total Modal", formatCurrency(totalMetrics.nba.modal)],
        ["Total Laba", formatCurrency(totalMetrics.nba.laba)],
        ["Jumlah Transaksi", totalMetrics.nba.jumlahTransaksi.toString()],
        ["Profit Margin", `${totalMetrics.nba.profitMargin}%`],
        ["Target Pencapaian", `${totalMetrics.nba.targetAchievement}%`],
      ],
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Detail Transaksi Nur Bouquet
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 10,
      head: [["Tanggal", "Atas Nama", "Total Harga", "Modal", "Status"]],
      body: transaksiNBA.map((t) => [
        formatDate(t.tanggal_transaksi),
        t.atas_nama,
        formatCurrency(t.total_harga),
        formatCurrency(t.modal_pembuatan * (t.jumlah || 1)),
        t.status_pembayaran,
      ]),
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // --- HALAMAN 4: NUR MUA ---
    doc.addPage();

    // Header Nur MUA
    doc.setFontSize(18);
    doc.setTextColor(21, 94, 117);
    doc.text("Detail Transaksi - Nur Make Up Art", 105, 20, {
      align: "center",
    });

    // Ringkasan Nur MUA
    doc.autoTable({
      startY: 30,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Pendapatan", formatCurrency(totalMetrics.nmua.pendapatan)],
        ["Total Modal", formatCurrency(totalMetrics.nmua.modal)],
        ["Total Laba", formatCurrency(totalMetrics.nmua.laba)],
        ["Jumlah Transaksi", totalMetrics.nmua.jumlahTransaksi.toString()],
        ["Profit Margin", `${totalMetrics.nmua.profitMargin}%`],
        ["Target Pencapaian", `${totalMetrics.nmua.targetAchievement}%`],
      ],
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Detail Transaksi Nur MUA
    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 10,
      head: [["Tanggal", "Atas Nama", "Total Harga", "Modal", "Status"]],
      body: bookingNMUA.map((t) => [
        formatDate(t.tanggal_transaksi),
        t.atas_nama,
        formatCurrency(t.total_harga),
        formatCurrency(t.kisaran_modal),
        t.status_pembayaran,
      ]),
      styles: { fontSize: 10, font: "times" },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        font: "times",
        fontStyle: "bold",
      },
    });

    // Footer untuk setiap halaman
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128);
      doc.text(
        `Halaman ${i} dari ${totalPages}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        "Dokumen ini dicetak secara digital - Hak Cipta Nur Group",
        105,
        doc.internal.pageSize.height - 5,
        { align: "center" }
      );
    }

    doc.save(
      `Laporan_Keuangan_NurGroup_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center">
          <div className="loader border-t-4 border-[#FFD700] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-[#DAA520]">Loading...</p>
        </div>
      </div>
    );
  }

  const totalMetrics = {
    nc: calculateBusinessMetrics(transaksiNC, "NC"),
    nba: calculateBusinessMetrics(transaksiNBA, "NBA"),
    nmua: calculateBusinessMetrics(bookingNMUA, "NMUA"),
  };

  const grandTotal = {
    pendapatan:
      totalMetrics.nc.pendapatan +
      totalMetrics.nba.pendapatan +
      totalMetrics.nmua.pendapatan,
    modal:
      totalMetrics.nc.modal + totalMetrics.nba.modal + totalMetrics.nmua.modal,
    laba: totalMetrics.nc.laba + totalMetrics.nba.laba + totalMetrics.nmua.laba,
    jumlahTransaksi:
      totalMetrics.nc.jumlahTransaksi +
      totalMetrics.nba.jumlahTransaksi +
      totalMetrics.nmua.jumlahTransaksi,
  };

  return (
    // KeuanganNurGroup
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#FFD700]">
            Laporan Keuangan NUR GROUP
          </h1>
          <div className="flex gap-4">
            {/* <Button
              variant="outline"
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#3d3d3d]"
              onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button> */}
            {/* <Button
              variant="outline"
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#3d3d3d]"
              onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button> */}
            <Button
              variant="outline"
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#3d3d3d]"
              onClick={generatePDF}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak PDF
            </Button>
            <Button
              variant="outline"
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#3d3d3d]"
              onClick={fetchData}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-900/50 border-red-600">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showFilters && (
          <Card className="mb-8 bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Filter Data</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="border-[#FFD700] text-[#DAA520]">
                    <SelectValue placeholder="Pilih Rentang Waktu" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                    <SelectItem value="all" className="text-[#DAA520]">
                      Semua Waktu
                    </SelectItem>
                    <SelectItem value="today" className="text-[#DAA520]">
                      Hari Ini
                    </SelectItem>
                    <SelectItem value="week" className="text-[#DAA520]">
                      7 Hari Terakhir
                    </SelectItem>
                    <SelectItem value="month" className="text-[#DAA520]">
                      30 Hari Terakhir
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Select
                  value={selectedBusiness}
                  onValueChange={setSelectedBusiness}>
                  <SelectTrigger className="border-[#FFD700] text-[#DAA520]">
                    <SelectValue placeholder="Pilih Bisnis" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                    <SelectItem value="all" className="text-[#DAA520]">
                      Semua Bisnis
                    </SelectItem>
                    <SelectItem value="NC" className="text-[#DAA520]">
                      Nur Cake
                    </SelectItem>
                    <SelectItem value="NBA" className="text-[#DAA520]">
                      Nur Bouquet
                    </SelectItem>
                    <SelectItem value="NMUA" className="text-[#DAA520]">
                      Nur MUA
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.startDate,
                    to: dateRange.endDate,
                  }}
                  onSelect={(range) =>
                    setDateRange({
                      startDate: range?.from,
                      endDate: range?.to,
                    })
                  }
                  className="rounded-md border border-[#FFD700] bg-[#2d2d2d] text-[#DAA520]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">
                Total Pendapatan Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(grandTotal.pendapatan)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">
                Total Modal Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(grandTotal.modal)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Total Laba Group</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${grandTotal.laba >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(grandTotal.laba)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Total Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {grandTotal.jumlahTransaksi} Transaksi
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Nur Cake Metrics */}
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Nur Cake</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-[#DAA520]">
                <p>Pendapatan: {formatCurrency(totalMetrics.nc.pendapatan)}</p>
                <p>Modal: {formatCurrency(totalMetrics.nc.modal)}</p>
                <p
                  className={
                    totalMetrics.nc.laba >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }>
                  Laba: {formatCurrency(totalMetrics.nc.laba)}
                </p>
                <p>Jumlah Transaksi: {totalMetrics.nc.jumlahTransaksi}</p>
                <p>Profit Margin: {totalMetrics.nc.profitMargin}%</p>
                <p>Target Pencapaian: {totalMetrics.nc.targetAchievement}%</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full bg-[#3d3d3d] rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    Number(totalMetrics.nc.targetAchievement) >= 100
                      ? "bg-green-500"
                      : Number(totalMetrics.nc.targetAchievement) >= 75
                        ? "bg-[#FFD700]"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, totalMetrics.nc.targetAchievement)}%`,
                  }}
                />
              </div>
            </CardFooter>
          </Card>

          {/* Nur Bouquet Metrics */}
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Nur Bouquet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-[#DAA520]">
                <p>Pendapatan: {formatCurrency(totalMetrics.nba.pendapatan)}</p>
                <p>Modal: {formatCurrency(totalMetrics.nba.modal)}</p>
                <p
                  className={
                    totalMetrics.nba.laba >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }>
                  Laba: {formatCurrency(totalMetrics.nba.laba)}
                </p>
                <p>Jumlah Transaksi: {totalMetrics.nba.jumlahTransaksi}</p>
                <p>Profit Margin: {totalMetrics.nba.profitMargin}%</p>
                <p>Target Pencapaian: {totalMetrics.nba.targetAchievement}%</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full bg-[#3d3d3d] rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    Number(totalMetrics.nba.targetAchievement) >= 100
                      ? "bg-green-500"
                      : Number(totalMetrics.nba.targetAchievement) >= 75
                        ? "bg-[#FFD700]"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, totalMetrics.nba.targetAchievement)}%`,
                  }}
                />
              </div>
            </CardFooter>
          </Card>

          {/* Nur MUA Metrics */}
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Nur MUA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-[#DAA520]">
                <p>
                  Pendapatan: {formatCurrency(totalMetrics.nmua.pendapatan)}
                </p>
                <p>Modal: {formatCurrency(totalMetrics.nmua.modal)}</p>
                <p
                  className={
                    totalMetrics.nmua.laba >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }>
                  Laba: {formatCurrency(totalMetrics.nmua.laba)}
                </p>
                <p>Jumlah Transaksi: {totalMetrics.nmua.jumlahTransaksi}</p>
                <p>Profit Margin: {totalMetrics.nmua.profitMargin}%</p>
                <p>Target Pencapaian: {totalMetrics.nmua.targetAchievement}%</p>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full bg-[#3d3d3d] rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    Number(totalMetrics.nmua.targetAchievement) >= 100
                      ? "bg-green-500"
                      : Number(totalMetrics.nmua.targetAchievement) >= 75
                        ? "bg-[#FFD700]"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, totalMetrics.nmua.targetAchievement)}%`,
                  }}
                />
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Grafik Perbandingan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-[#2d2d2d] border-[#FFD700] border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#FFD700]">
                Perbandingan Keuangan
              </h2>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32 border-[#FFD700] text-[#DAA520]">
                  <SelectValue placeholder="Tipe Grafik" />
                </SelectTrigger>
                <SelectContent className="bg-[#2d2d2d] border-[#FFD700]">
                  <SelectItem value="line" className="text-[#DAA520]">
                    Line Chart
                  </SelectItem>
                  <SelectItem value="bar" className="text-[#DAA520]">
                    Bar Chart
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              {chartType === "line" ? (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="name" stroke="#DAA520" />
                  <YAxis stroke="#DAA520" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2d2d2d",
                      border: "1px solid #FFD700",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pendapatan"
                    stroke="#FFD700"
                    name="Pendapatan"
                  />
                  <Line
                    type="monotone"
                    dataKey="modal"
                    stroke="#EF4444"
                    name="Modal"
                  />
                  <Line
                    type="monotone"
                    dataKey="laba"
                    stroke="#22C55E"
                    name="Laba"
                  />
                </LineChart>
              ) : (
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3d3d3d" />
                  <XAxis dataKey="name" stroke="#DAA520" />
                  <YAxis stroke="#DAA520" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2d2d2d",
                      border: "1px solid #FFD700",
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="pendapatan" fill="#FFD700" name="Pendapatan" />
                  <Bar dataKey="modal" fill="#EF4444" name="Modal" />
                  <Bar dataKey="laba" fill="#22C55E" name="Laba" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Card>
          {/* Grafik Profit Margin */}
          <Card className="p-4 bg-[#2d2d2d] border-[#FFD700] border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#FFD700]">
                Profit Margin Comparison
              </h2>
              <PieChartIcon className="w-6 h-6 text-[#FFD700]" />
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={getChartData().filter((item) => item.pendapatan > 0)} // Hanya tampilkan data dengan pendapatan > 0
                  dataKey="profitMargin"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#FFD700"
                  label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}>
                  {getChartData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#FFD700", // Bright gold
                          "#DAA520", // Golden rod
                          "#B8860B", // Dark golden rod
                        ][index % 3]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2d2d2d",
                    border: "1px solid #FFD700",
                    color: "#DAA520",
                  }}
                  formatter={(value) => `${value.toFixed(2)}%`}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[#DAA520]">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Bagian debugging data (bisa dihapus setelah dijamin berfungsi) */}
            <div className="mt-4 text-xs text-[#DAA520]">
              <details>
                <summary>Debug Data</summary>
                <pre>
                  {JSON.stringify(
                    getChartData().map((item) => ({
                      name: item.name,
                      pendapatan: item.pendapatan,
                      laba: item.laba,
                      profitMargin: item.profitMargin,
                    })),
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default KeuanganNurGroup;
