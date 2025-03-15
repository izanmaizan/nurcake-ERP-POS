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

  const COLORS = ["#155E75", "#ef4444", "#22c55e", "#f59e0b"];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateDateRange(timeRange);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [transaksiRes, produkRes] = await Promise.all([
        fetch("http://localhost:3000/transaksi-nc"),
        fetch("http://localhost:3000/produkNC"),
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

    console.log("--- Debug Info Transaksi ---");
    console.log("Jumlah transaksi:", filteredTransaksi.length);

    filteredTransaksi.forEach((t, index) => {
      console.log(`\nTransaksi #${index + 1}:`);
      console.log("Total Harga:", t.total_harga);
      totalPenjualan += Number(t.total_harga || 0);

      console.log("Items:", t.items);
      if (Array.isArray(t.items)) {
        t.items.forEach((item) => {
          if (item.tipe === "custom_cake") {
            const modalItem =
              Number(item.modal || 0) * Number(item.jumlah_pesanan || 1);
            console.log("Modal Custom Cake:", modalItem);
            totalModal += modalItem;
          } else if (item.tipe === "kue_ready") {
            const modalItem =
              Number(item.modal_pembuatan || 0) * Number(item.jumlah || 1);
            console.log("Modal Kue Ready:", modalItem);
            totalModal += modalItem;
          } else if (item.tipe === "produk_reguler") {
            // Pastikan total_modal ada, jika tidak gunakan perhitungan alternatif
            let modalItem;
            if (item.total_modal) {
              modalItem = Number(item.total_modal || 0);
            } else {
              modalItem = Number(item.modal || 0) * Number(item.jumlah || 1);
            }
            console.log("Modal Produk Reguler:", modalItem);
            totalModal += modalItem;
          }
        });
      }

      // Menangani additional_items
      if (t.additional_items && Array.isArray(t.additional_items)) {
        console.log("Additional Items:", t.additional_items);
        t.additional_items.forEach((item) => {
          const biayaTambahan =
            Number(item.harga || 0) * Number(item.jumlah || 1);
          console.log("Biaya Tambahan:", biayaTambahan);
          totalBiayaTambahan += biayaTambahan;
        });
      }
    });

    const labaKotor = totalPenjualan - totalModal - totalBiayaTambahan;
    const marginProfit = totalPenjualan
      ? ((labaKotor / totalPenjualan) * 100).toFixed(2)
      : 0;

    console.log("\n--- Hasil Perhitungan Akhir ---");
    console.log("Total Penjualan:", totalPenjualan);
    console.log("Total Modal:", totalModal);
    console.log("Total Biaya Tambahan:", totalBiayaTambahan);
    console.log("Laba Kotor:", labaKotor);
    console.log("Margin Profit:", marginProfit, "%");

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
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center">
          <div className="loader border-t-4 border-[#FFD700] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-[#DAA520]">Loading...</p>
        </div>
      </div>
    );
  }

  const financials = calculateFinancials();
  const chartData = prepareChartData();
  const pieChartData = preparePieChartData();

  return (
    // Keuangan Nur Cake
    <section className="bg-[#1a1a1a] p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#FFD700]">
          Laporan Keuangan NurCake
        </h1>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Total Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(financials.totalPenjualan)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Total Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(financials.totalModal)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Biaya Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(financials.totalBiayaTambahan)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Laba Kotor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {formatCurrency(financials.labaKotor)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2d2d2d] border-[#FFD700] border">
            <CardHeader>
              <CardTitle className="text-[#FFD700]">Margin Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#DAA520]">
                {financials.marginProfit}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="overview"
          className="bg-[#2d2d2d] p-6 rounded-lg border-[#FFD700] border">
          <TabsList className="bg-[#3d3d3d]">
            <TabsTrigger
              value="overview"
              className="text-[#DAA520] data-[state=active]:bg-[#2d2d2d] data-[state=active]:text-[#FFD700]">
              Overview Keuangan
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="text-[#DAA520] data-[state=active]:bg-[#2d2d2d] data-[state=active]:text-[#FFD700]">
              Perbandingan
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="text-[#DAA520] data-[state=active]:bg-[#2d2d2d] data-[state=active]:text-[#FFD700]">
              Tren Keuangan
            </TabsTrigger>
          </TabsList>

          <div className="mb-4 mt-4 flex justify-end gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700]">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32 bg-[#3d3d3d] text-[#DAA520] border-[#FFD700]">
                <SelectValue placeholder="Tipe Grafik" />
              </SelectTrigger>
              <SelectContent className="bg-[#2d2d2d] text-[#DAA520] border-[#FFD700]">
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="tanggal" stroke="#DAA520" />
                    <YAxis stroke="#DAA520" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#2d2d2d",
                        border: "1px solid #FFD700",
                      }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend wrapperStyle={{ color: "#DAA520" }} />
                    <Line
                      type="monotone"
                      dataKey="penjualan"
                      stroke="#FFD700"
                      name="Penjualan"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="modal"
                      stroke="#DAA520"
                      name="Modal"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="laba"
                      stroke="#FFC000"
                      name="Laba"
                      strokeWidth={2}
                    />
                  </LineChart>
                ) : chartType === "bar" ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="tanggal" stroke="#DAA520" />
                    <YAxis stroke="#DAA520" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#2d2d2d",
                        border: "1px solid #FFD700",
                      }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend wrapperStyle={{ color: "#DAA520" }} />
                    <Bar dataKey="penjualan" fill="#FFD700" name="Penjualan" />
                    <Bar dataKey="modal" fill="#DAA520" name="Modal" />
                    <Bar dataKey="laba" fill="#FFC000" name="Laba" />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="tanggal" stroke="#DAA520" />
                    <YAxis stroke="#DAA520" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#2d2d2d",
                        border: "1px solid #FFD700",
                      }}
                      labelStyle={{ color: "#FFD700" }}
                    />
                    <Legend wrapperStyle={{ color: "#DAA520" }} />
                    <Area
                      type="monotone"
                      dataKey="penjualan"
                      stackId="1"
                      stroke="#FFD700"
                      fill="#FFD700"
                      name="Penjualan"
                    />
                    <Area
                      type="monotone"
                      dataKey="modal"
                      stackId="2"
                      stroke="#DAA520"
                      fill="#DAA520"
                      name="Modal"
                    />
                    <Area
                      type="monotone"
                      dataKey="laba"
                      stackId="3"
                      stroke="#FFC000"
                      fill="#FFC000"
                      name="Laba"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value">
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
                      backgroundColor: "#2d2d2d",
                      border: "1px solid #FFD700",
                    }}
                    labelStyle={{ color: "#FFD700" }}
                  />
                  <Legend wrapperStyle={{ color: "#DAA520" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    Pertumbuhan Bulanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="tanggal" stroke="#DAA520" />
                        <YAxis stroke="#DAA520" />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #FFD700",
                          }}
                          labelStyle={{ color: "#FFD700" }}
                        />
                        <Legend wrapperStyle={{ color: "#DAA520" }} />
                        <Line
                          type="monotone"
                          dataKey="penjualan"
                          stroke="#FFD700"
                          name="Penjualan"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    Margin Profit per Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="tanggal" stroke="#DAA520" />
                        <YAxis stroke="#DAA520" />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #FFD700",
                          }}
                          labelStyle={{ color: "#FFD700" }}
                        />
                        <Legend wrapperStyle={{ color: "#DAA520" }} />
                        <Area
                          type="monotone"
                          dataKey="laba"
                          stroke="#FFD700"
                          fill="#FFD700"
                          name="Margin Profit"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    Analisis Biaya
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="tanggal" stroke="#DAA520" />
                        <YAxis stroke="#DAA520" />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #FFD700",
                          }}
                          labelStyle={{ color: "#FFD700" }}
                        />
                        <Legend wrapperStyle={{ color: "#DAA520" }} />
                        <Bar dataKey="modal" fill="#FFD700" name="Modal" />
                        <Bar
                          dataKey="biayaTambahan"
                          fill="#DAA520"
                          name="Biaya Tambahan"
                        />
                        <Bar
                          dataKey="penjualan"
                          fill="#FFC000"
                          name="Penjualan"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    Rasio Keuangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="tanggal" stroke="#DAA520" />
                        <YAxis stroke="#DAA520" />
                        <Tooltip
                          formatter={(value) => `${(value * 100).toFixed(2)}%`}
                          contentStyle={{
                            backgroundColor: "#2d2d2d",
                            border: "1px solid #FFD700",
                          }}
                          labelStyle={{ color: "#FFD700" }}
                        />
                        <Legend wrapperStyle={{ color: "#DAA520" }} />
                        <Bar
                          dataKey={(entry) => entry.laba / entry.penjualan}
                          fill="#FFD700"
                          name="Margin Ratio"
                        />
                        <Bar
                          dataKey={(entry) => entry.modal / entry.penjualan}
                          fill="#DAA520"
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
      </div>
    </section>
  );
};

export default KeuanganNurCake;
