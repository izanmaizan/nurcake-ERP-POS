import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const KeuanganNurCake = () => {
  // Warna tema krem/emas
  const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A", "#B8A361"];

  // Variasi warna krem/emas
  const bgColor = "#FAF3E0"; // Krem muda/background utama
  const textColor = "#8B7D3F"; // Emas gelap untuk teks
  const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
  const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
  const API = import.meta.env.VITE_API;

  const [transaksi, setTransaksi] = useState([]);
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateDateRange(timeRange);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [transaksiRes, produkRes] = await Promise.all([
        fetch(`${API}/transaksi-nc`),
        fetch(`${API}/produkNC`),
      ]);

      const transaksiData = await transaksiRes.json();
      const produkData = await produkRes.json();

      setTransaksi(transaksiData);
      setProduk(produkData);
      setLoading(false);
    } catch (error) {
      setError("Gagal mengambil data");
      setLoading(false);
    }
  };

  const updateDateRange = (range) => {
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = null;
    }
    setDateRange({ startDate, endDate: now });
  };

  const filterTransaksiByDate = (transaksiList) => {
    if (timeRange === "all" || !dateRange.startDate) return transaksiList;
    return transaksiList.filter((t) => {
      const transaksiDate = new Date(t.tanggal_transaksi);
      return (
          transaksiDate >= dateRange.startDate &&
          transaksiDate <= dateRange.endDate
      );
    });
  };

  const calculateFinancials = () => {
    const filteredTransaksi = filterTransaksiByDate(transaksi);
    let totalPenjualan = 0;
    let totalModal = 0;
    let totalBiayaTambahan = 0;

    filteredTransaksi.forEach((t) => {
      totalPenjualan += Number(t.total_harga || 0);

      if (Array.isArray(t.items)) {
        t.items.forEach((item) => {
          if (item.tipe === "custom_cake") {
            const modalItem =
                Number(item.modal || 0) * Number(item.jumlah_pesanan || 1);
            totalModal += modalItem;
          } else if (item.tipe === "kue_ready") {
            const modalItem =
                Number(item.modal_pembuatan || 0) * Number(item.jumlah || 1);
            totalModal += modalItem;
          } else if (item.tipe === "produk_reguler") {
            // Pastikan total_modal ada, jika tidak gunakan perhitungan alternatif
            let modalItem;
            if (item.total_modal) {
              modalItem = Number(item.total_modal || 0);
            } else {
              modalItem = Number(item.modal || 0) * Number(item.jumlah || 1);
            }
            totalModal += modalItem;
          }
        });
      }

      // Menangani additional_items
      if (t.additional_items && Array.isArray(t.additional_items)) {
        t.additional_items.forEach((item) => {
          const biayaTambahan =
              Number(item.harga || 0) * Number(item.jumlah || 1);
          totalBiayaTambahan += biayaTambahan;
        });
      }
    });

    const labaKotor = totalPenjualan - totalModal - totalBiayaTambahan;
    const marginProfit = totalPenjualan
        ? ((labaKotor / totalPenjualan) * 100).toFixed(2)
        : 0;

    return {
      totalPenjualan,
      totalModal,
      totalBiayaTambahan,
      labaKotor,
      marginProfit,
    };
  };

  const prepareChartData = () => {
    const filteredTransaksi = filterTransaksiByDate(transaksi);
    const dataByDate = {};

    filteredTransaksi.forEach((t) => {
      const date = new Date(t.tanggal_transaksi).toLocaleDateString("id-ID");
      if (!dataByDate[date]) {
        dataByDate[date] = {
          tanggal: date,
          penjualan: 0,
          modal: 0,
          biayaTambahan: 0,
          laba: 0,
        };
      }

      dataByDate[date].penjualan += Number(t.total_harga || 0);

      // Hitung modal
      if (Array.isArray(t.items)) {
        t.items.forEach((item) => {
          if (item.tipe === "custom_cake") {
            dataByDate[date].modal +=
                Number(item.modal || 0) * Number(item.jumlah_pesanan || 1);
          } else if (item.tipe === "kue_ready") {
            dataByDate[date].modal +=
                Number(item.modal_pembuatan || 0) * Number(item.jumlah || 1);
          } else if (item.tipe === "produk_reguler") {
            let modalItem;
            if (item.total_modal) {
              modalItem = Number(item.total_modal || 0);
            } else {
              modalItem = Number(item.modal || 0) * Number(item.jumlah || 1);
            }
            dataByDate[date].modal += modalItem;
          }
        });
      }

      // Hitung biaya tambahan
      if (t.additional_items && Array.isArray(t.additional_items)) {
        t.additional_items.forEach((item) => {
          dataByDate[date].biayaTambahan +=
              Number(item.harga || 0) * Number(item.jumlah || 1);
        });
      }

      // Hitung laba
      dataByDate[date].laba =
          dataByDate[date].penjualan -
          dataByDate[date].modal -
          dataByDate[date].biayaTambahan;
    });

    return Object.values(dataByDate);
  };

  const preparePieChartData = () => {
    const financials = calculateFinancials();
    return [
      { name: "Modal", value: financials.totalModal },
      { name: "Biaya Tambahan", value: financials.totalBiayaTambahan },
      { name: "Laba Kotor", value: financials.labaKotor },
    ];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: bgColor }}>
          <div className="text-center">
            <div
                className="loader border-t-4 rounded-full w-12 h-12 animate-spin mx-auto mb-4"
                style={{ borderColor: textColor }}
            ></div>
            <p style={{ color: textColor }}>Loading...</p>
          </div>
        </div>
    );
  }

  const financials = calculateFinancials();
  const chartData = prepareChartData();
  const pieChartData = preparePieChartData();

  return (
      // Keuangan Nur Cake
      <section className="p-3 md:p-6 min-h-screen mt-20 md:mt-14" style={{ backgroundColor: bgColor }}>
        <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
          <h1 className="text-xl md:text-3xl font-bold text-center md:text-left" style={{ color: textColor }}>
            Laporan Keuangan NurCake
          </h1>

          {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {/* Cards untuk KPI - di-scroll untuk mobile */}
          <div className="overflow-x-auto pb-2 md:pb-0 -mx-3 md:mx-0 px-3 md:px-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 min-w-0">
              {/* Card 1: Total Penjualan */}
              <Card className="border w-full md:w-auto" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                <CardHeader className="pb-1 pt-2 px-3 md:pb-2 md:pt-4 md:px-6">
                  <CardTitle className="text-sm md:text-xl" style={{ color: textColor }}>Total Penjualan</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 px-3 md:pb-4 md:px-6">
                  <p className="text-base md:text-2xl font-bold" style={{ color: secondaryTextColor }}>
                    {formatCurrency(financials.totalPenjualan)}
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Total Modal */}
              <Card className="border w-full md:w-auto" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                <CardHeader className="pb-1 pt-2 px-3 md:pb-2 md:pt-4 md:px-6">
                  <CardTitle className="text-sm md:text-xl" style={{ color: textColor }}>Total Modal</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 px-3 md:pb-4 md:px-6">
                  <p className="text-base md:text-2xl font-bold" style={{ color: secondaryTextColor }}>
                    {formatCurrency(financials.totalModal)}
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Biaya Tambahan */}
              <Card className="border w-full md:w-auto" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                <CardHeader className="pb-1 pt-2 px-3 md:pb-2 md:pt-4 md:px-6">
                  <CardTitle className="text-sm md:text-xl" style={{ color: textColor }}>Biaya Tambahan</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 px-3 md:pb-4 md:px-6">
                  <p className="text-base md:text-2xl font-bold" style={{ color: secondaryTextColor }}>
                    {formatCurrency(financials.totalBiayaTambahan)}
                  </p>
                </CardContent>
              </Card>

              {/* Card 4: Laba Kotor */}
              <Card className="border w-full md:w-auto" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                <CardHeader className="pb-1 pt-2 px-3 md:pb-2 md:pt-4 md:px-6">
                  <CardTitle className="text-sm md:text-xl" style={{ color: textColor }}>Laba Kotor</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 px-3 md:pb-4 md:px-6">
                  <p className="text-base md:text-2xl font-bold" style={{ color: secondaryTextColor }}>
                    {formatCurrency(financials.labaKotor)}
                  </p>
                </CardContent>
              </Card>

              {/* Card 5: Margin Profit - Penuh di mobile */}
              <Card className="border w-full col-span-2 md:col-span-1 md:w-auto" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                <CardHeader className="pb-1 pt-2 px-3 md:pb-2 md:pt-4 md:px-6">
                  <CardTitle className="text-sm md:text-xl text-center md:text-left" style={{ color: textColor }}>Margin Profit</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 px-3 md:pb-4 md:px-6 flex justify-center md:block">
                  <p className="text-base md:text-2xl font-bold text-center md:text-left" style={{ color: secondaryTextColor }}>
                    {financials.marginProfit}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs
              defaultValue="overview"
              className="p-3 md:p-6 rounded-lg border"
              style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}
          >
            {/* TabsList yang sudah dioptimasi untuk mobile */}
            <div className="overflow-x-auto -mx-3 px-3 md:overflow-visible md:px-0 md:mx-0">
              <TabsList
                  style={{ backgroundColor: `${bgColor}` }}
                  className="mb-4 min-w-max md:min-w-0 w-auto"
              >
                <TabsTrigger
                    value="overview"
                    className="text-sm md:text-base px-2 py-1 md:px-4 md:py-2"
                    style={{
                      color: secondaryTextColor,
                      backgroundColor: 'transparent',
                      ['&[data-state=active]']: {
                        backgroundColor: bgColor,
                        color: textColor,
                      }
                    }}
                >
                  Overview Keuangan
                </TabsTrigger>
                <TabsTrigger
                    value="comparison"
                    className="text-sm md:text-base px-2 py-1 md:px-4 md:py-2"
                    style={{
                      color: secondaryTextColor,
                      backgroundColor: 'transparent',
                      ['&[data-state=active]']: {
                        backgroundColor: bgColor,
                        color: textColor,
                      }
                    }}
                >
                  Perbandingan
                </TabsTrigger>
                <TabsTrigger
                    value="trends"
                    className="text-sm md:text-base px-2 py-1 md:px-4 md:py-2"
                    style={{
                      color: secondaryTextColor,
                      backgroundColor: 'transparent',
                      ['&[data-state=active]']: {
                        backgroundColor: bgColor,
                        color: textColor,
                      }
                    }}
                >
                  Tren Keuangan
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tombol filter yang dioptimasi untuk mobile */}
            <div className="mb-4 mt-2 md:mt-4 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                    className="w-full h-9 text-sm md:text-base md:h-10 sm:w-32 border"
                    style={{ backgroundColor: bgColor, color: textColor, borderColor: secondaryTextColor }}
                >
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: cardBgColor, color: textColor, borderColor: secondaryTextColor }}>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>

              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger
                    className="w-full h-9 text-sm md:text-base md:h-10 sm:w-32 border"
                    style={{ backgroundColor: bgColor, color: textColor, borderColor: secondaryTextColor }}
                >
                  <SelectValue placeholder="Tipe Grafik" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: cardBgColor, color: textColor, borderColor: secondaryTextColor }}>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="overview">
              <div className="h-48 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                      <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                        <XAxis
                            dataKey="tanggal"
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              // Untuk layar kecil, tampilkan format tanggal pendek
                              const parts = value.split('/');
                              return window.innerWidth < 768 && parts.length > 1 ?
                                  `${parts[0]}/${parts[1]}` : value;
                            }}
                        />
                        <YAxis
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              // Format nilai Y axis untuk layar kecil
                              return window.innerWidth < 768 ?
                                  new Intl.NumberFormat('id-ID', {
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                  }).format(value) : formatCurrency(value);
                            }}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: cardBgColor,
                              border: `1px solid ${secondaryTextColor}`,
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: textColor }}
                        />
                        <Legend
                            wrapperStyle={{ color: textColor, fontSize: '10px' }}
                            iconSize={10}
                        />
                        <Line
                            type="monotone"
                            dataKey="penjualan"
                            stroke="#D4AF37"
                            name="Penjualan"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="modal"
                            stroke="#8B7D3F"
                            name="Modal"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="laba"
                            stroke="#C5B358"
                            name="Laba"
                            strokeWidth={2}
                        />
                      </LineChart>
                  ) : chartType === "bar" ? (
                      <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                        <XAxis
                            dataKey="tanggal"
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              const parts = value.split('/');
                              return window.innerWidth < 768 && parts.length > 1 ?
                                  `${parts[0]}/${parts[1]}` : value;
                            }}
                        />
                        <YAxis
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              return window.innerWidth < 768 ?
                                  new Intl.NumberFormat('id-ID', {
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                  }).format(value) : formatCurrency(value);
                            }}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: cardBgColor,
                              border: `1px solid ${secondaryTextColor}`,
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: textColor }}
                        />
                        <Legend
                            wrapperStyle={{ color: textColor, fontSize: '10px' }}
                            iconSize={10}
                        />
                        <Bar dataKey="penjualan" fill="#D4AF37" name="Penjualan" />
                        <Bar dataKey="modal" fill="#8B7D3F" name="Modal" />
                        <Bar dataKey="laba" fill="#C5B358" name="Laba" />
                      </BarChart>
                  ) : (
                      <AreaChart
                          data={chartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                        <XAxis
                            dataKey="tanggal"
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              const parts = value.split('/');
                              return window.innerWidth < 768 && parts.length > 1 ?
                                  `${parts[0]}/${parts[1]}` : value;
                            }}
                        />
                        <YAxis
                            stroke={textColor}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => {
                              return window.innerWidth < 768 ?
                                  new Intl.NumberFormat('id-ID', {
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                  }).format(value) : formatCurrency(value);
                            }}
                        />
                        <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: cardBgColor,
                              border: `1px solid ${secondaryTextColor}`,
                              fontSize: '12px'
                            }}
                            labelStyle={{ color: textColor }}
                        />
                        <Legend
                            wrapperStyle={{ color: textColor, fontSize: '10px' }}
                            iconSize={10}
                        />
                        <Area
                            type="monotone"
                            dataKey="penjualan"
                            stackId="1"
                            stroke="#D4AF37"
                            fill="#D4AF37"
                            name="Penjualan"
                        />
                        <Area
                            type="monotone"
                            dataKey="modal"
                            stackId="2"
                            stroke="#8B7D3F"
                            fill="#8B7D3F"
                            name="Modal"
                        />
                        <Area
                            type="monotone"
                            dataKey="laba"
                            stackId="3"
                            stroke="#C5B358"
                            fill="#C5B358"
                            name="Laba"
                        />
                      </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <div className="h-48 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false} // Sembunyikan garis label di mobile
                        label={({ name, value, percent }) => {
                          // Label sederhana untuk mobile
                          return window.innerWidth < 768 ?
                              `${name}: ${percent.toFixed(0)}%` :
                              `${name}: ${formatCurrency(value)}`;
                        }}
                        outerRadius={window.innerWidth < 768 ? 80 : 120}
                        innerRadius={window.innerWidth < 768 ? 30 : 0} // Donut chart di mobile
                        fill="#8884d8"
                        dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                          <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                          />
                      ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: cardBgColor,
                          border: `1px solid ${secondaryTextColor}`,
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: textColor }}
                    />
                    <Legend
                        wrapperStyle={{ color: textColor, fontSize: '10px' }}
                        iconSize={10}
                        layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
                        verticalAlign={window.innerWidth < 768 ? "bottom" : "middle"}
                        align={window.innerWidth < 768 ? "center" : "right"}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6">
                <Card className="border" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                  <CardHeader className="py-2 px-3 md:px-6 md:py-4">
                    <CardTitle className="text-sm md:text-base" style={{ color: textColor }}>
                      Pertumbuhan Bulanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 md:px-6">
                    <div className="h-40 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis
                              dataKey="tanggal"
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                const parts = value.split('/');
                                return window.innerWidth < 768 && parts.length > 1 ?
                                    `${parts[0]}/${parts[1]}` : value;
                              }}
                          />
                          <YAxis
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                return window.innerWidth < 768 ?
                                    new Intl.NumberFormat('id-ID', {
                                      notation: 'compact',
                                      compactDisplay: 'short'
                                    }).format(value) : formatCurrency(value);
                              }}
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: cardBgColor,
                                border: `1px solid ${secondaryTextColor}`,
                                fontSize: '12px'
                              }}
                              labelStyle={{ color: textColor }}
                          />
                          <Legend
                              wrapperStyle={{ color: textColor, fontSize: '10px' }}
                              iconSize={10}
                          />
                          <Line
                              type="monotone"
                              dataKey="penjualan"
                              stroke="#D4AF37"
                              name="Penjualan"
                              strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                  <CardHeader className="py-2 px-3 md:px-6 md:py-4">
                    <CardTitle className="text-sm md:text-base" style={{ color: textColor }}>
                      Margin Profit per Transaksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 md:px-6">
                    <div className="h-40 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis
                              dataKey="tanggal" stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                const parts = value.split('/');
                                return window.innerWidth < 768 && parts.length > 1 ?
                                    `${parts[0]}/${parts[1]}` : value;
                              }}
                          />
                          <YAxis
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                return window.innerWidth < 768 ?
                                    new Intl.NumberFormat('id-ID', {
                                      notation: 'compact',
                                      compactDisplay: 'short'
                                    }).format(value) : formatCurrency(value);
                              }}
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: cardBgColor,
                                border: `1px solid ${secondaryTextColor}`,
                                fontSize: '12px'
                              }}
                              labelStyle={{ color: textColor }}
                          />
                          <Legend
                              wrapperStyle={{ color: textColor, fontSize: '10px' }}
                              iconSize={10}
                          />
                          <Area
                              type="monotone"
                              dataKey="laba"
                              stroke="#D4AF37"
                              fill="#D4AF37"
                              name="Margin Profit"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                  <CardHeader className="py-2 px-3 md:px-6 md:py-4">
                    <CardTitle className="text-sm md:text-base" style={{ color: textColor }}>
                      Analisis Biaya
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 md:px-6">
                    <div className="h-40 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis
                              dataKey="tanggal"
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                const parts = value.split('/');
                                return window.innerWidth < 768 && parts.length > 1 ?
                                    `${parts[0]}/${parts[1]}` : value;
                              }}
                          />
                          <YAxis
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                return window.innerWidth < 768 ?
                                    new Intl.NumberFormat('id-ID', {
                                      notation: 'compact',
                                      compactDisplay: 'short'
                                    }).format(value) : formatCurrency(value);
                              }}
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: cardBgColor,
                                border: `1px solid ${secondaryTextColor}`,
                                fontSize: '12px'
                              }}
                              labelStyle={{ color: textColor }}
                          />
                          <Legend
                              wrapperStyle={{ color: textColor, fontSize: '10px' }}
                              iconSize={10}
                              layout={window.innerWidth < 768 ? "horizontal" : "vertical"}
                              verticalAlign="bottom"
                              align="center"
                          />
                          <Bar dataKey="modal" fill="#D4AF37" name="Modal" />
                          <Bar
                              dataKey="biayaTambahan"
                              fill="#8B7D3F"
                              name="Biaya Tambahan"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ backgroundColor: cardBgColor, borderColor: secondaryTextColor }}>
                  <CardHeader className="py-2 px-3 md:px-6 md:py-4">
                    <CardTitle className="text-sm md:text-base" style={{ color: textColor }}>
                      Rasio Keuangan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 md:px-6">
                    <div className="h-40 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis
                              dataKey="tanggal"
                              stroke={textColor}
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => {
                                const parts = value.split('/');
                                return window.innerWidth < 768 && parts.length > 1 ?
                                    `${parts[0]}/${parts[1]}` : value;
                              }}
                          />
                          <YAxis
                              stroke={textColor}
                              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                              tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                              formatter={(value) => `${(value * 100).toFixed(2)}%`}
                              contentStyle={{
                                backgroundColor: cardBgColor,
                                border: `1px solid ${secondaryTextColor}`,
                                fontSize: '12px'
                              }}
                              labelStyle={{ color: textColor }}
                          />
                          <Legend
                              wrapperStyle={{ color: textColor, fontSize: '10px' }}
                              iconSize={10}
                          />
                          <Bar
                              dataKey={(entry) => entry.laba / entry.penjualan}
                              fill="#D4AF37"
                              name="Margin Ratio"
                          />
                          <Bar
                              dataKey={(entry) => entry.modal / entry.penjualan}
                              fill="#8B7D3F"
                              name="Cost Ratio"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Tombol Ekspor Report (Tambahan untuk mobile) */}
          <div className="flex justify-center md:justify-end mt-4">
            <button
                className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                style={{
                  backgroundColor: secondaryTextColor,
                  color: cardBgColor,
                  borderColor: textColor
                }}
            >
              Ekspor Laporan
            </button>
          </div>
        </div>
      </section>
  );
};

export default KeuanganNurCake;