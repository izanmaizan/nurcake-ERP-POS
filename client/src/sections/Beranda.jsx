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

  // Warna tema
  const COLORS = ["#FFD700", "#DAA520", "#FFC000"]; // Variasi warna emas
  const bgColor = "#1a1a1a"; // Hitam pekat
  const textColor = "#FFD700"; // Emas
  const secondaryTextColor = "#DAA520"; // Emas gelap
  const cardBgColor = "#2d2d2d"; // Hitam sekunder

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const response = await axios.get("http://localhost:3000/me", {
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
                axios.get("http://localhost:3000/users"),
                axios.get("http://localhost:3000/transaksi-nc"),
                axios.get("http://localhost:3000/transaksi-nba"),
                axios.get("http://localhost:3000/booking"),
                axios.get("http://localhost:3000/transaksi-nc"), // Tambahan fetch untuk modal NC
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
            const ncResponse = await axios.get(
              "http://localhost:3000/transaksi-nc"
            );
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
            const nbaResponse = await axios.get(
              "http://localhost:3000/transaksi-nba"
            );
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
            const nmuaResponse = await axios.get(
              "http://localhost:3000/booking"
            );
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
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center">
          <p className="text-[#FFD700] mb-4">{error}</p>
          <Link
            to="/login"
            className="text-[#1a1a1a] bg-[#FFD700] hover:bg-[#DAA520] focus:ring-4 focus:outline-none focus:ring-[#FFC000] font-medium rounded-lg text-sm px-5 py-2 transition-all">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Beranda
    <main className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FFD700]">Dashboard</h1>
          <p className="text-[#DAA520]">
            Selamat datang kembali di NUR GROUP ERP {role}, {name || username}!
          </p>
        </div>

        {/* Statistik Cards */}
        <div
          className={`grid gap-6 mb-8 ${
            role === "admin"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-3"
          }`}>
          {role === "admin" && (
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-[#3d3d3d] rounded-lg">
                  <Users className="h-6 w-6 text-[#FFD700]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#DAA520]">
                    Total Akun
                  </p>
                  <h3 className="text-2xl font-bold text-[#FFD700]">
                    {summaryData.totalAkun}
                  </h3>
                </div>
              </CardContent>
            </Card>
          )}

          {role !== "nurmakeup" ? (
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-[#3d3d3d] rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#FFD700]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#DAA520]">
                    Total Penjualan
                  </p>
                  <h3 className="text-2xl font-bold text-[#FFD700]">
                    {formatCurrency(summaryData.totalPenjualan)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-[#3d3d3d] rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#FFD700]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#DAA520]">
                    Total Booking
                  </p>
                  <h3 className="text-2xl font-bold text-[#FFD700]">
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
              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardContent className="flex items-center p-6">
                  <div className="p-2 bg-[#3d3d3d] rounded-lg">
                    <Wallet className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[#DAA520]">
                      Total Modal
                    </p>
                    <h3 className="text-2xl font-bold text-[#FFD700]">
                      {formatCurrency(summaryData.totalModal)}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2d2d2d] border-[#FFD700] border">
                <CardContent className="flex items-center p-6">
                  <div className="p-2 bg-[#3d3d3d] rounded-lg">
                    <DollarSign className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[#DAA520]">
                      Total Penghasilan
                    </p>
                    <h3 className="text-2xl font-bold text-[#FFD700]">
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
          // Layout untuk Admin (3 grafik)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <Card className="lg:col-span-2 bg-[#2d2d2d] border-[#FFD700] border">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">
                  Penjualan per Kategori (Bar Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareSalesData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" stroke="#DAA520" />
                      <YAxis
                        tickFormatter={(value) => `Rp${value / 1000000}M`}
                        stroke="#DAA520"
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#2d2d2d",
                          border: "1px solid #FFD700",
                        }}
                        labelStyle={{ color: "#FFD700" }}
                      />
                      <Legend wrapperStyle={{ color: "#DAA520" }} />
                      <Bar dataKey="Nur Cake" fill="#FFD700" />
                      <Bar dataKey="Nur Bouquet" fill="#DAA520" />
                      <Bar dataKey="Nur Make Up" fill="#FFC000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart (hanya untuk admin) */}
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">
                  Distribusi Penjualan (Pie Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summaryData.salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
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
                          backgroundColor: "#2d2d2d",
                          border: "1px solid #FFD700",
                        }}
                        labelStyle={{ color: "#FFD700" }}
                      />
                      <Legend wrapperStyle={{ color: "#DAA520" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card className="lg:col-span-3 bg-[#2d2d2d] border-[#FFD700] border">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">
                  Trend Penjualan (Line Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareSalesData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="bulan" stroke="#DAA520" />
                      <YAxis
                        tickFormatter={(value) => `Rp${value / 1000000}M`}
                        stroke="#DAA520"
                      />
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
                        dataKey="Nur Cake"
                        stroke="#FFD700"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Nur Bouquet"
                        stroke="#DAA520"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Nur Make Up"
                        stroke="#FFC000"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Layout untuk role selain Admin (2 grafik)
          <div className="grid grid-cols-1 gap-6">
            {/* Bar Chart (ukuran penuh) */}
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">
                  Penjualan per Kategori (Bar Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareSalesData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" stroke="#DAA520" />
                      <YAxis
                        tickFormatter={(value) => `Rp${value / 1000000}M`}
                        stroke="#DAA520"
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#2d2d2d",
                          border: "1px solid #FFD700",
                        }}
                        labelStyle={{ color: "#FFD700" }}
                      />
                      <Legend wrapperStyle={{ color: "#DAA520" }} />
                      {role === "nurcake" && (
                        <Bar dataKey="Nur Cake" fill="#FFD700" />
                      )}
                      {role === "nurbouquet" && (
                        <Bar dataKey="Nur Bouquet" fill="#DAA520" />
                      )}
                      {role === "nurmakeup" && (
                        <Bar dataKey="Nur Make Up" fill="#FFC000" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Line Chart (ukuran penuh) */}
            <Card className="bg-[#2d2d2d] border-[#FFD700] border">
              <CardHeader>
                <CardTitle className="text-[#FFD700]">
                  Trend Penjualan (Line Chart)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareSalesData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="bulan" stroke="#DAA520" />
                      <YAxis
                        tickFormatter={(value) => `Rp${value / 1000000}M`}
                        stroke="#DAA520"
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#2d2d2d",
                          border: "1px solid #FFD700",
                        }}
                        labelStyle={{ color: "#FFD700" }}
                      />
                      <Legend wrapperStyle={{ color: "#DAA520" }} />
                      {role === "nurcake" && (
                        <Line
                          type="monotone"
                          dataKey="Nur Cake"
                          stroke="#FFD700"
                          strokeWidth={2}
                        />
                      )}
                      {role === "nurbouquet" && (
                        <Line
                          type="monotone"
                          dataKey="Nur Bouquet"
                          stroke="#DAA520"
                          strokeWidth={2}
                        />
                      )}
                      {role === "nurmakeup" && (
                        <Line
                          type="monotone"
                          dataKey="Nur Make Up"
                          stroke="#FFC000"
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
