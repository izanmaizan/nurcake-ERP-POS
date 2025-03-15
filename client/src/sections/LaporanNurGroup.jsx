import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Printer } from "lucide-react";

const LaporanNurGroup = () => {
  const data = [
    {
      bulan: "Januari",
      "Nur Cake": 14500000,
      "Nur Bouquet Aest": 4000000,
      "Nur Make Up Art": 7500000,
    },
    {
      bulan: "Februari",
      "Nur Cake": 17000000,
      "Nur Bouquet Aest": 5000000,
      "Nur Make Up Art": 6000000,
    },
    {
      bulan: "Maret",
      "Nur Cake": 19000000,
      "Nur Bouquet Aest": 3000000,
      "Nur Make Up Art": 8500000,
    },
    {
      bulan: "April",
      "Nur Cake": 12000000,
      "Nur Bouquet Aest": 4500000,
      "Nur Make Up Art": 4000000,
    },
    {
      bulan: "Mei",
      "Nur Cake": 15000000,
      "Nur Bouquet Aest": 5500000,
      "Nur Make Up Art": 9000000,
    },
    {
      bulan: "Juni",
      "Nur Cake": 20000000,
      "Nur Bouquet Aest": 6000000,
      "Nur Make Up Art": 8500000,
    },
    {
      bulan: "Juli",
      "Nur Cake": 13500000,
      "Nur Bouquet Aest": 3000000,
      "Nur Make Up Art": 4500000,
    },
    {
      bulan: "Agustus",
      "Nur Cake": 11000000,
      "Nur Bouquet Aest": 2500000,
      "Nur Make Up Art": 7000000,
    },
    {
      bulan: "September",
      "Nur Cake": 18000000,
      "Nur Bouquet Aest": 5000000,
      "Nur Make Up Art": 3500000,
    },
    {
      bulan: "Oktober",
      "Nur Cake": 20000000,
      "Nur Bouquet Aest": 6000000,
      "Nur Make Up Art": 9000000,
    },
    {
      bulan: "November",
      "Nur Cake": 16500000,
      "Nur Bouquet Aest": 4500000,
      "Nur Make Up Art": 8000000,
    },
    {
      bulan: "Desember",
      "Nur Cake": 17500000,
      "Nur Bouquet Aest": 4000000,
      "Nur Make Up Art": 5000000,
    },
  ];

  const getTotalPenjualan = () => {
    return data.reduce((total, item) => {
      return (
        total +
        item["Nur Cake"] +
        item["Nur Bouquet Aest"] +
        item["Nur Make Up Art"]
      );
    }, 0);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Penjualan Nur Group</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              padding: 10px 0;
            }
            .subtitle {
              font-size: 16px;
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 10px;
              text-align: right;
            }
            th {
              background-color: #f5f5f5;
              text-align: center;
            }
            td:first-child {
              text-align: left;
            }
            .total-row {
              font-weight: bold;
              background-color: #f5f5f5;
            }
            .signature-section {
              margin-top: 50px;
              text-align: right;
            }
            .signature-line {
              margin-top: 80px;
              border-top: 1px solid #333;
              width: 200px;
              display: inline-block;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">LAPORAN PENJUALAN NUR GROUP</h1>
            <p class="subtitle">Periode: Januari - Desember 2025</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Nur Cake</th>
                <th>Nur Bouquet Aest</th>
                <th>Nur Make Up Art</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (item) => `
                <tr>
                  <td>${item.bulan}</td>
                  <td>Rp ${item["Nur Cake"].toLocaleString("id-ID")}</td>
                  <td>Rp ${item["Nur Bouquet Aest"].toLocaleString("id-ID")}</td>
                  <td>Rp ${item["Nur Make Up Art"].toLocaleString("id-ID")}</td>
                  <td>Rp ${(item["Nur Cake"] + item["Nur Bouquet Aest"] + item["Nur Make Up Art"]).toLocaleString("id-ID")}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td>Total Keseluruhan</td>
                <td colspan="4">Rp ${getTotalPenjualan().toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>

          <div class="signature-section">
            <p>Padang, ${new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
            <div class="signature-line"></div>
            <p>Admin Utama Nur Group</p>
            <p>NIP. .........................</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <section className="bg-gray-100 py-16 px-5 h-full w-full md:py-20 md:px-20">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[40px] font-semibold mb-5 text-[#155E75] font-Roboto">
            Laporan Penjualan Nur Group
          </CardTitle>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-8 overflow-x-auto">
            <BarChart
              width={800}
              height={400}
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip
                formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
              />
              <Legend />
              <Bar dataKey="Nur Cake" fill="#8884d8" />
              <Bar dataKey="Nur Bouquet Aest" fill="#82ca9d" />
              <Bar dataKey="Nur Make Up Art" fill="#ffc658" />
            </BarChart>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Bulan</th>
                  <th className="border p-2">Nur Cake</th>
                  <th className="border p-2">Nur Bouquet Aest</th>
                  <th className="border p-2">Nur Make Up Art</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">{item.bulan}</td>
                    <td className="border p-2 text-right">
                      Rp {item["Nur Cake"].toLocaleString("id-ID")}
                    </td>
                    <td className="border p-2 text-right">
                      Rp {item["Nur Bouquet Aest"].toLocaleString("id-ID")}
                    </td>
                    <td className="border p-2 text-right">
                      Rp {item["Nur Make Up Art"].toLocaleString("id-ID")}
                    </td>
                    <td className="border p-2 text-right">
                      Rp{" "}
                      {(
                        item["Nur Cake"] +
                        item["Nur Bouquet Aest"] +
                        item["Nur Make Up Art"]
                      ).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="border p-2">Total Keseluruhan</td>
                  <td className="border p-2 text-right" colSpan={4}>
                    Rp {getTotalPenjualan().toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LaporanNurGroup;
