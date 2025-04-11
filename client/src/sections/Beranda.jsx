import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Users, TrendingUp, Wallet, DollarSign } from "lucide-react";
import axios from "axios";

const Beranda = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [salesData, setSalesData] = useState({});
  const [summaryData, setSummaryData] = useState({
    totalAkun: 0,
    totalPenjualan: 0,
    totalModal: 0,
    totalPenghasilan: 0,
    salesByCategory: [],
  });

  // Warna tema krem/emas
  const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"]; // Variasi warna krem/emas
  const bgColor = "#FAF3E0"; // Krem muda/background utama
  const textColor = "#8B7D3F"; // Emas gelap untuk teks
  const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
  const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
  const API = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const response = await axios.get(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          },
        });
        setUsername(response.data.username);
        setName(response.data.name);
        setRole(response.data.role);

        let transactions = {};
        let totalPenjualan = 0;
        let totalModal = 0;
        let userCountData = 0;

        // Fetch data berdasarkan role
        switch (response.data.role) {
          case "admin":
            // Fetch semua data untuk admin
            const [usersRes, ncRes, nbaRes, nmuaRes, ncTransaksiRes] =
                await Promise.all([
                  axios.get(`${API}/users`),
                  axios.get(`${API}/transaksi-nc`),
                  axios.get(`${API}/transaksi-nba`),
                  axios.get(`${API}/booking`),
                  axios.get(`${API}/transaksi-nc`),
                ]);

            transactions = {
              nc: ncRes.data,
              nba: nbaRes.data,
              nmua: nmuaRes.data,
            };
            userCountData = usersRes.data.length;

            // Hitung total penjualan
            totalPenjualan = [
              ...ncRes.data,
              ...nbaRes.data,
              ...nmuaRes.data,
            ].reduce((acc, curr) => acc + Number(curr.total_harga || 0), 0);

            // Hitung modal NC dengan perhitungan detail
            let modalNC = 0;
            ncTransaksiRes.data.forEach((t) => {
              if (Array.isArray(t.items)) {
                t.items.forEach((item) => {
                  if (item.tipe === "custom_cake") {
                    modalNC +=
                        Number(item.modal || 0) *
                        Number(item.jumlah_pesanan || 1);
                  } else if (item.tipe === "kue_ready") {
                    modalNC +=
                        Number(item.modal_pembuatan || 0) *
                        Number(item.jumlah || 1);
                  } else if (item.tipe === "produk_reguler") {
                    modalNC += item.total_modal
                        ? Number(item.total_modal)
                        : Number(item.modal || 0) * Number(item.jumlah || 1);
                  }
                });
              }
              // Tambahkan biaya tambahan
              if (t.additional_items && Array.isArray(t.additional_items)) {
                t.additional_items.forEach((item) => {
                  modalNC += Number(item.harga || 0) * Number(item.jumlah || 1);
                });
              }
            });

            // Gabungkan modal NC dengan modal lainnya
            totalModal =
                modalNC +
                nbaRes.data.reduce(
                    (acc, curr) => acc + Number(curr.modal_pembuatan || 0),
                    0
                ) +
                nmuaRes.data.reduce(
                    (acc, curr) => acc + Number(curr.kisaran_modal || 0),
                    0
                );
            break;

          case "nurcake":
            const ncResponse = await axios.get(`${API}/transaksi-nc`);
            transactions = { nc: ncResponse.data };
            totalPenjualan = ncResponse.data.reduce(
                (acc, curr) => acc + Number(curr.total_harga || 0),
                0
            );

            // Hitung modal untuk NC dengan perhitungan detail
            totalModal = 0;
            ncResponse.data.forEach((t) => {
              if (Array.isArray(t.items)) {
                t.items.forEach((item) => {
                  if (item.tipe === "custom_cake") {
                    totalModal +=
                        Number(item.modal || 0) *
                        Number(item.jumlah_pesanan || 1);
                  } else if (item.tipe === "kue_ready") {
                    totalModal +=
                        Number(item.modal_pembuatan || 0) *
                        Number(item.jumlah || 1);
                  } else if (item.tipe === "produk_reguler") {
                    totalModal += item.total_modal
                        ? Number(item.total_modal)
                        : Number(item.modal || 0) * Number(item.jumlah || 1);
                  }
                });
              }
              // Tambahkan biaya tambahan
              if (t.additional_items && Array.isArray(t.additional_items)) {
                t.additional_items.forEach((item) => {
                  totalModal +=
                      Number(item.harga || 0) * Number(item.jumlah || 1);
                });
              }
            });
            break;

            // Case lainnya tetap sama
          case "nurbouquet":
            const nbaResponse = await axios.get(`${API}/transaksi-nba`);
            transactions = { nba: nbaResponse.data };
            totalPenjualan = nbaResponse.data.reduce(
                (acc, curr) => acc + Number(curr.total_harga || 0),
                0
            );
            totalModal = nbaResponse.data.reduce(
                (acc, curr) => acc + Number(curr.modal_pembuatan || 0),
                0
            );
            break;

          case "nurmakeup":
            const nmuaResponse = await axios.get(`${API}/booking`);
            transactions = { nmua: nmuaResponse.data };
            totalPenjualan = nmuaResponse.data.reduce(
                (acc, curr) => acc + Number(curr.total_harga || 0),
                0
            );
            totalModal = nmuaResponse.data.reduce(
                (acc, curr) => acc + Number(curr.kisaran_modal || 0),
                0
            );
            break;
        }

        setSalesData(transactions);
        setUserCount(userCountData);
        setSummaryData({
          totalAkun: userCountData,
          totalPenjualan,
          totalModal,
          totalPenghasilan: totalPenjualan - totalModal,
          salesByCategory: prepareSalesCategories(
              transactions,
              response.data.role
          ),
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Terjadi kesalahan saat mengambil data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const prepareSalesCategories = (transactions, userRole) => {
    if (userRole === "admin") {
      return [
        {
          name: "Nur Cake",
          value:
              transactions.nc?.reduce(
                  (acc, curr) => acc + Number(curr.total_harga || 0),
                  0
              ) || 0,
        },
        {
          name: "Nur Bouquet",
          value:
              transactions.nba?.reduce(
                  (acc, curr) => acc + Number(curr.total_harga || 0),
                  0
              ) || 0,
        },
        {
          name: "Nur Make Up",
          value:
              transactions.nmua?.reduce(
                  (acc, curr) => acc + Number(curr.total_harga || 0),
                  0
              ) || 0,
        },
      ];
    } else {
      const categoryName = {
        nurcake: "Nur Cake",
        nurbouquet: "Nur Bouquet",
        nurmakeup: "Nur Make Up",
      }[userRole];

      const data = Object.values(transactions)[0] || [];
      return [
        {
          name: categoryName,
          value: data.reduce(
              (acc, curr) => acc + Number(curr.total_harga || 0),
              0
          ),
        },
      ];
    }
  };

  const prepareSalesData = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    return monthNames.map((month) => {
      let monthData = {
        bulan: month,
      };

      if (role === "admin" || role === "nurcake") {
        monthData["Nur Cake"] = (salesData.nc || [])
            .filter((sale) => {
              const saleDate = new Date(sale.tanggal_transaksi);
              return (
                  saleDate &&
                  !isNaN(saleDate) &&
                  saleDate.toLocaleString("id-ID", { month: "short" }) === month
              );
            })
            .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
      }

      if (role === "admin" || role === "nurbouquet") {
        monthData["Nur Bouquet"] = (salesData.nba || [])
            .filter((sale) => {
              const saleDate = new Date(sale.tanggal_transaksi);
              return (
                  saleDate &&
                  !isNaN(saleDate) &&
                  saleDate.toLocaleString("id-ID", { month: "short" }) === month
              );
            })
            .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
      }

      if (role === "admin" || role === "nurmakeup") {
        monthData["Nur Make Up"] = (salesData.nmua || [])
            .filter((booking) => {
              const bookingDate = new Date(booking.tanggal_booking);
              return (
                  bookingDate &&
                  !isNaN(bookingDate) &&
                  bookingDate.toLocaleString("id-ID", { month: "short" }) === month
              );
            })
            .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
      }

      return monthData;
    });
  };

  const renderCustomizedLabel = ({
                                   cx,
                                   cy,
                                   midAngle,
                                   innerRadius,
                                   outerRadius,
                                   percent,
                                 }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
        <text
            x={x}
            y={y}
            fill="#8B7D3F"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#FAF3E0]">
          <div className="text-center">
            <div className="loader border-t-4 border-[#D4AF37] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
            <p className="text-[#8B7D3F]">Loading...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#FAF3E0]">
          <div className="text-center">
            <p className="text-[#8B7D3F] mb-4">{error}</p>
            <Link
                to="/login"
                className="text-[#FAF3E0] bg-[#D4AF37] hover:bg-[#C5B358] focus:ring-4 focus:outline-none focus:ring-[#E6BE8A] font-medium rounded-lg text-sm px-5 py-2 transition-all">
              Kembali ke Login
            </Link>
          </div>
        </div>
    );
  }

  return (
      // Beranda dengan tema krem/emas
      <main className="bg-[#FAF3E0] py-8 px-4 h-full w-full md:py-12 md:px-8 lg:py-16 lg:px-12 mt-10 md:mt-0">
        <div className="max-w-7xl mx-auto mt-4">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#8B7D3F]">Dashboard</h1>
            <p className="text-[#B8A361] text-sm md:text-base">
              Selamat datang kembali di NUR GROUP ERP {role}, {name || username}!
            </p>
          </div>

          {/* Statistik Cards - Responsif */}
          <div
              className={`grid gap-4 md:gap-6 mb-6 md:mb-8 ${
                  role === "admin"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              }`}>
            {role === "admin" && (
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardContent className="flex items-center p-4 md:p-6">
                    <div className="p-2 bg-[#F5EDD6] rounded-lg">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs md:text-sm font-medium text-[#B8A361]">
                        Total Akun
                      </p>
                      <h3 className="text-lg md:text-2xl font-bold text-[#8B7D3F]">
                        {summaryData.totalAkun}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
            )}

            {role !== "nurmakeup" ? (
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardContent className="flex items-center p-4 md:p-6">
                    <div className="p-2 bg-[#F5EDD6] rounded-lg">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs md:text-sm font-medium text-[#B8A361]">
                        Total Penjualan
                      </p>
                      <h3 className="text-lg md:text-2xl font-bold text-[#8B7D3F]">
                        {formatCurrency(summaryData.totalPenjualan)}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
            ) : (
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardContent className="flex items-center p-4 md:p-6">
                    <div className="p-2 bg-[#F5EDD6] rounded-lg">
                      <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs md:text-sm font-medium text-[#B8A361]">
                        Total Booking
                      </p>
                      <h3 className="text-lg md:text-2xl font-bold text-[#8B7D3F]">
                        {formatCurrency(summaryData.totalPenjualan)}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
            )}

            {(role === "admin" ||
                role === "nurcake" ||
                role === "nurbouquet" ||
                role === "nurmakeup") && (
                <>
                  <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                    <CardContent className="flex items-center p-4 md:p-6">
                      <div className="p-2 bg-[#F5EDD6] rounded-lg">
                        <Wallet className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs md:text-sm font-medium text-[#B8A361]">
                          Total Modal
                        </p>
                        <h3 className="text-lg md:text-2xl font-bold text-[#8B7D3F]">
                          {formatCurrency(summaryData.totalModal)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                    <CardContent className="flex items-center p-4 md:p-6">
                      <div className="p-2 bg-[#F5EDD6] rounded-lg">
                        <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs md:text-sm font-medium text-[#B8A361]">
                          Total Penghasilan
                        </p>
                        <h3 className="text-lg md:text-2xl font-bold text-[#8B7D3F]">
                          {formatCurrency(summaryData.totalPenghasilan)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </>
            )}
          </div>

          {/* Grafik */}
          {role === "admin" ? (
              // Layout untuk Admin (3 grafik) - Responsif
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Bar Chart */}
                <Card className="lg:col-span-2 bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[#8B7D3F] text-lg md:text-xl">
                      Penjualan per Kategori
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareSalesData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis dataKey="bulan" stroke="#B8A361" />
                          <YAxis
                              tickFormatter={(value) => `Rp${value / 1000000}M`}
                              stroke="#B8A361"
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: "#FFF8E7",
                                border: "1px solid #D4AF37",
                              }}
                              labelStyle={{ color: "#8B7D3F" }}
                          />
                          <Legend wrapperStyle={{ color: "#B8A361" }} />
                          <Bar dataKey="Nur Cake" fill="#D4AF37" />
                          <Bar dataKey="Nur Bouquet" fill="#C5B358" />
                          <Bar dataKey="Nur Make Up" fill="#E6BE8A" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Pie Chart (hanya untuk admin) */}
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[#8B7D3F] text-lg md:text-xl">
                      Distribusi Penjualan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                              data={summaryData.salesByCategory}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value">
                            {summaryData.salesByCategory.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                          </Pie>
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: "#FFF8E7",
                                border: "1px solid #D4AF37",
                              }}
                              labelStyle={{ color: "#8B7D3F" }}
                          />
                          <Legend wrapperStyle={{ color: "#B8A361" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Chart */}
                <Card className="lg:col-span-3 bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[#8B7D3F] text-lg md:text-xl">
                      Trend Penjualan (Line Chart)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prepareSalesData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis dataKey="bulan" stroke="#B8A361" />
                          <YAxis
                              tickFormatter={(value) => `Rp${value / 1000000}M`}
                              stroke="#B8A361"
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: "#FFF8E7",
                                border: "1px solid #D4AF37",
                              }}
                              labelStyle={{ color: "#8B7D3F" }}
                          />
                          <Legend wrapperStyle={{ color: "#B8A361" }} />
                          <Line
                              type="monotone"
                              dataKey="Nur Cake"
                              stroke="#D4AF37"
                              strokeWidth={2}
                          />
                          <Line
                              type="monotone"
                              dataKey="Nur Bouquet"
                              stroke="#C5B358"
                              strokeWidth={2}
                          />
                          <Line
                              type="monotone"
                              dataKey="Nur Make Up"
                              stroke="#E6BE8A"
                              strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
          ) : (
              // Layout untuk role selain Admin (2 grafik) - Responsif
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Bar Chart (ukuran penuh) */}
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[#8B7D3F] text-lg md:text-xl">
                      Penjualan per Kategori
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareSalesData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis dataKey="bulan" stroke="#B8A361" />
                          <YAxis
                              tickFormatter={(value) => `Rp${value / 1000000}M`}
                              stroke="#B8A361"
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: "#FFF8E7",
                                border: "1px solid #D4AF37",
                              }}
                              labelStyle={{ color: "#8B7D3F" }}
                          />
                          <Legend wrapperStyle={{ color: "#B8A361" }} />
                          {role === "nurcake" && (
                              <Bar dataKey="Nur Cake" fill="#D4AF37" />
                          )}
                          {role === "nurbouquet" && (
                              <Bar dataKey="Nur Bouquet" fill="#C5B358" />
                          )}
                          {role === "nurmakeup" && (
                              <Bar dataKey="Nur Make Up" fill="#E6BE8A" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Line Chart (ukuran penuh) */}
                <Card className="bg-[#FFF8E7] border-[#D4AF37] border shadow-md">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[#8B7D3F] text-lg md:text-xl">
                      Trend Penjualan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prepareSalesData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E6BE8A" />
                          <XAxis dataKey="bulan" stroke="#B8A361" />
                          <YAxis
                              tickFormatter={(value) => `Rp${value / 1000000}M`}
                              stroke="#B8A361"
                          />
                          <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: "#FFF8E7",
                                border: "1px solid #D4AF37",
                              }}
                              labelStyle={{ color: "#8B7D3F" }}
                          />
                          <Legend wrapperStyle={{ color: "#B8A361" }} />
                          {role === "nurcake" && (
                              <Line
                                  type="monotone"
                                  dataKey="Nur Cake"
                                  stroke="#D4AF37"
                                  strokeWidth={2}
                              />
                          )}
                          {role === "nurbouquet" && (
                              <Line
                                  type="monotone"
                                  dataKey="Nur Bouquet"
                                  stroke="#C5B358"
                                  strokeWidth={2}
                              />
                          )}
                          {role === "nurmakeup" && (
                              <Line
                                  type="monotone"
                                  dataKey="Nur Make Up"
                                  stroke="#E6BE8A"
                                  strokeWidth={2}
                              />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
};

export default Beranda;
