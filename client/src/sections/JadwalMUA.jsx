import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Clock,
  User,
  Package,
  Calendar as CalendarIcon,
  X,
  ChevronRight,
  Printer,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const customStyles = `
  .calendar-tile {
  position: relative;
  height: 100%;
}

.booking-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: #FFD700;
  color: #1a1a1a;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2d2d2d;
  color: #FFD700;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  display: none;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.1);
  border: 1px solid #FFD700;
}

.calendar-tile:hover .calendar-tooltip {
  display: block;
}

/* Gaya dasar kalender */
.react-calendar {
  background: #2d2d2d !important;
  border: 1px solid #FFD700 !important;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(218, 165, 32, 0.1);
}

/* Header kalender */
.react-calendar__navigation {
  margin-bottom: 16px;
}

.react-calendar__navigation button {
  color: #FFD700;
  font-weight: 600;
  font-size: 16px;
  padding: 8px;
  background: #2d2d2d;
  border-radius: 8px;
  transition: all 0.2s;
}

.react-calendar__navigation button:hover {
  background-color: #3d3d3d;
}

.react-calendar__navigation button:disabled {
  background-color: #2d2d2d;
  color: #666666;
}

/* Label hari */
.react-calendar__month-view__weekdays {
  color: #DAA520;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  padding: 8px 0;
}

.react-calendar__month-view__weekdays__weekday {
  text-decoration: none;
}

/* Tile kalender */
.react-calendar__tile {
  padding: 16px 6px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  background: #2d2d2d !important;
  color: #DAA520;
  position: relative;
}

/* Hover state */
.react-calendar__tile:hover {
  background-color: #3d3d3d !important;
  color: #FFD700;
}

/* Active state - tanggal yang dipilih */
.react-calendar__tile--active {
  background: #FFD700 !important;
  color: #1a1a1a !important;
  font-weight: bold;
}

/* Range selection states */
.react-calendar__tile--rangeStart {
  background: #FFD700 !important;
  color: #1a1a1a !important;
  font-weight: bold;
  border-radius: 8px 0 0 8px !important;
}

.react-calendar__tile--rangeEnd {
  background: #FFD700 !important;
  color: #1a1a1a !important;
  font-weight: bold;
  border-radius: 0 8px 8px 0 !important;
}

.react-calendar__tile--rangeBetween {
  background: #3d3d3d !important;
  color: #FFD700 !important;
  font-weight: 500;
}

/* Hari ini */
.react-calendar__tile--now {
  background: #2d2d2d !important;
  color: #FFD700 !important;
  font-weight: bold;
  border: 2px dashed #FFD700 !important;
}

/* Hari ini ketika dipilih */
.react-calendar__tile--now.react-calendar__tile--active,
.react-calendar__tile--now.react-calendar__tile--rangeStart,
.react-calendar__tile--now.react-calendar__tile--rangeEnd {
  background: #FFD700 !important;
  color: #1a1a1a !important;
  border: none !important;
}

.has-bookings {
  background-color: #2d2d2d;
  color: #FFD700;
  font-weight: bold;
}

.has-bookings::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: #FFD700;
}

/* Tanggal dari bulan lain */
.react-calendar__month-view__days__day--neighboringMonth {
  color: #666666;
}

/* Gaya hover untuk navigasi bulan */
.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus {
  background-color: #3d3d3d;
  border-radius: 8px;
}
`;

const JadwalMUA = () => {
  // Definisikan semua state di awal komponen
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRangeMode, setIsRangeMode] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:3000/booking");
        const bookingsData = response.data.map((booking) => ({
          id: booking.id_booking,
          date: booking.tanggal_booking,
          time: booking.waktu_mulai,
          client: booking.nama_pelanggan,
          package: booking.nama_paket,
          status: booking.status_booking,
          notes: booking.catatan,
          phoneNumber: booking.no_telepon,
          address: booking.alamat,
          totalPrice: booking.total_harga,
          dpAmount: booking.dp_amount,
          remainingPayment: booking.sisa_pembayaran,
        }));
        setAppointments(bookingsData);
        setFilteredAppointments(bookingsData);
        setIsLoading(false);
      } catch (err) {
        setError("Gagal memuat data booking");
        setIsLoading(false);
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [];
    if (isRangeMode && Array.isArray(dateRange) && dateRange.length === 2) {
      // Logic untuk range date tetap sama
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      filtered = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    } else if (!isRangeMode && dateRange[0]) {
      // Perbaikan untuk single date selection
      const selectedDate = new Date(dateRange[0]);
      const selectedDateStr = selectedDate.toISOString().split("T")[0];

      filtered = appointments.filter((appointment) => {
        const appointmentDateStr = appointment.date;
        return appointmentDateStr === selectedDateStr;
      });
    }
    setFilteredAppointments(filtered);
  }, [dateRange, appointments, isRangeMode]);

  // Handler untuk perubahan tanggal
  const handleDateChange = (newDate) => {
    setDateRange(Array.isArray(newDate) ? newDate : [newDate]);

    // Filter appointments for selected date(s)
    let filtered = [];
    if (Array.isArray(newDate)) {
      // Range mode
      const startDate = new Date(newDate[0]);
      const endDate = new Date(newDate[1]);
      filtered = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    } else {
      // Single date mode
      const selectedDateStr = newDate.toISOString().split("T")[0];
      filtered = appointments.filter(
        (appointment) => appointment.date === selectedDateStr
      );
    }
    setSelectedDateAppointments(filtered);
  };

  // Fungsi untuk memformat tanggal ke string YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Effect untuk filtering appointments
  useEffect(() => {
    if (!appointments.length) return;

    let filtered = [];

    if (isRangeMode && Array.isArray(dateRange) && dateRange.length === 2) {
      // Mode rentang tanggal
      const startDate = new Date(dateRange[0]);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999);

      filtered = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    } else if (!isRangeMode && dateRange[0]) {
      // Mode tanggal tunggal
      const selectedDateStr = formatDate(dateRange[0]);

      filtered = appointments.filter((appointment) => {
        return appointment.date === selectedDateStr;
      });
    }

    setFilteredAppointments(filtered);
  }, [dateRange, appointments, isRangeMode]);

  // Handler untuk perubahan mode pemilihan tanggal
  const handleRangeModeChange = (e) => {
    const newRangeMode = e.target.checked;
    setIsRangeMode(newRangeMode);

    // Reset selections
    if (newRangeMode) {
      setDateRange([new Date(), new Date()]);
      setSelectedDateAppointments([]);
    } else {
      const singleDate = [new Date()];
      setDateRange(singleDate);
      handleDateChange(singleDate[0]);
    }
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const formattedDate = date.toISOString().split("T")[0];
    return appointments.filter(
      (appointment) => appointment.date === formattedDate
    );
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const bookingsOnDate = getBookingsForDate(date);
    if (bookingsOnDate.length === 0) return null;

    return (
      <div className="calendar-tile">
        <div className="booking-badge">{bookingsOnDate.length}</div>
        <div className="calendar-tooltip">
          {bookingsOnDate.length} booking pada tanggal ini
        </div>
      </div>
    );
  };

  const tileClassName = ({ date }) => {
    if (!date) return "";

    const formattedDate = date.toISOString().split("T")[0];
    const currentSelectedDate = new Date(date).toISOString().split("T")[0];
    const selectedDateStr = new Date(date).toISOString().split("T")[0];

    let classes = [];

    if (
      appointments.some((appointment) => appointment.date === formattedDate)
    ) {
      classes.push("has-bookings");
    }

    if (selectedDateStr === currentSelectedDate) {
      classes.push("selected-date");
    }

    return classes.join(" ");
  };

  const handleTableClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  const handleViewDateBookings = (appointment) => {
    if (!appointment?.date) return;
    const newDate = new Date(appointment.date);
    // setDate(newDate);
    setIsDetailOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk mencetak PDF
  const handlePrintPDF = () => {
    const doc = new jsPDF();

    // Konfigurasi font
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    // Header
    doc.text("Laporan Jadwal Makeup Artist (MUA)", 14, 15);

    // Informasi periode
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const periodeText = isRangeMode
      ? `Periode: ${dateRange[0].toLocaleDateString("id-ID")} - ${dateRange[1].toLocaleDateString("id-ID")}`
      : `Tanggal: ${dateRange[0].toLocaleDateString("id-ID")}`;
    doc.text(periodeText, 14, 25);

    // Ringkasan status booking
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Status Booking:", 14, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const confirmedCount = appointments.filter(
      (a) => a.status.toLowerCase() === "confirmed"
    ).length;
    const pendingCount = appointments.filter(
      (a) => a.status.toLowerCase() === "pending"
    ).length;
    const cancelledCount = appointments.filter(
      (a) => a.status.toLowerCase() === "cancelled"
    ).length;

    doc.text(`Total Booking: ${appointments.length}`, 14, 42);
    doc.text(`Confirmed: ${confirmedCount}`, 14, 48);
    doc.text(`Pending: ${pendingCount}`, 14, 54);
    doc.text(`Cancelled: ${cancelledCount}`, 14, 60);

    // Tabel booking
    const tableHeaders = [
      [
        "Klien",
        "Paket",
        "Status",
        "Tanggal",
        "Waktu",
        "Total Harga",
        "DP",
        "Sisa",
      ],
    ];

    const tableData = filteredAppointments.map((booking) => [
      booking.client,
      booking.package,
      booking.status,
      booking.date,
      booking.time,
      `Rp ${booking.totalPrice?.toLocaleString()}`,
      `Rp ${booking.dpAmount?.toLocaleString()}`,
      `Rp ${booking.remainingPayment?.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 70,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [21, 94, 117],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Tambahkan timestamp
    const timestamp = new Date().toLocaleString("id-ID");
    doc.text(
      `Dicetak pada: ${timestamp}`,
      14,
      doc.internal.pageSize.height - 10
    );

    // Simpan PDF
    doc.save(
      `Jadwal_MUA_${isRangeMode ? "Periode" : "Tanggal"}_${dateRange[0].toLocaleDateString("id-ID").replace(/\//g, "-")}.pdf`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155E75]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    // Jadwal MUA
    // Jadwal MUA
    <section className="bg-[#1a1a1a] py-16 px-5 h-full w-full md:py-20 md:px-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-4">
            Jadwal Makeup Artist (MUA)
          </h1>
          <p className="text-[#DAA520]">
            Kelola dan lihat jadwal booking makeup artist dengan mudah
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 border border-[#FFD700]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CalendarIcon className="w-6 h-6 text-[#FFD700] mr-2" />
                <h2 className="text-xl font-semibold text-[#FFD700]">
                  Kalender Booking
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isRangeMode}
                    onChange={handleRangeModeChange}
                    className="form-checkbox h-4 w-4 text-[#FFD700]"
                  />
                  <span className="ml-2 text-sm text-[#DAA520]">
                    Pilih Rentang Tanggal
                  </span>
                </label>
                <p className="text-sm text-[#DAA520]">
                  {filteredAppointments.length} booking pada tanggal terpilih
                </p>
              </div>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={isRangeMode ? dateRange : dateRange[0]}
              selectRange={isRangeMode}
              className="border-0 w-full text-[#DAA520]"
              tileContent={tileContent}
              tileClassName={tileClassName}
            />
            <div className="mt-4 text-sm text-[#DAA520]">
              {isRangeMode && dateRange.length === 2 ? (
                <p>
                  Menampilkan booking dari{" "}
                  {dateRange[0].toLocaleDateString("id-ID")}
                  hingga {dateRange[1].toLocaleDateString("id-ID")}
                </p>
              ) : (
                <p>
                  Menampilkan booking pada{" "}
                  {dateRange[0].toLocaleDateString("id-ID")}
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 border border-[#FFD700]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-[#FFD700] mr-2" />
                <h2 className="text-xl font-semibold text-[#FFD700]">
                  Daftar Booking
                </h2>
              </div>
              <button
                onClick={handlePrintPDF}
                className="inline-flex items-center px-4 py-2 bg-[#FFD700] text-[#1a1a1a] rounded-md hover:bg-[#DAA520] transition-colors">
                <Printer className="w-4 h-4 mr-2" />
                Cetak PDF
              </button>
            </div>
            {filteredAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#3d3d3d]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#DAA520] uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#DAA520] uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#DAA520] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#DAA520] uppercase tracking-wider">
                        Tanggal & Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#DAA520] uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#2d2d2d] divide-y divide-[#3d3d3d]">
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="hover:bg-[#3d3d3d] transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <User className="h-10 w-10 text-[#DAA520]" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#DAA520]">
                                {appointment.client}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#DAA520]">
                            {appointment.package}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              appointment.status
                            )}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#DAA520]">
                          {appointment.date} {appointment.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleTableClick(appointment)}
                            className="text-[#FFD700] hover:text-[#DAA520] text-sm font-medium">
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#DAA520]">
                Tidak ada booking pada tanggal yang dipilih
              </div>
            )}
          </div>
        </div>

        {/* Modal Detail */}
        {isDetailOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-md w-full mx-4 border border-[#FFD700]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#FFD700]">
                  Detail Booking
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[#DAA520] hover:text-[#FFD700]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#DAA520]">Client</label>
                  <p className="font-medium text-[#FFD700]">
                    {selectedAppointment.client}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">No. Telepon</label>
                  <p className="font-medium text-[#FFD700]">
                    {selectedAppointment.phoneNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">Alamat</label>
                  <p className="font-medium text-[#FFD700]">
                    {selectedAppointment.address}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">Package</label>
                  <p className="font-medium text-[#FFD700]">
                    {selectedAppointment.package}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">Total Harga</label>
                  <p className="font-medium text-[#FFD700]">
                    Rp {selectedAppointment.totalPrice?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">DP</label>
                  <p className="font-medium text-[#FFD700]">
                    Rp {selectedAppointment.dpAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">
                    Sisa Pembayaran
                  </label>
                  <p className="font-medium text-[#FFD700]">
                    Rp {selectedAppointment.remainingPayment?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">
                    Tanggal & Waktu
                  </label>
                  <p className="font-medium text-[#FFD700]">
                    {selectedAppointment.date} {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#DAA520]">Status</label>
                  <span
                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      selectedAppointment.status
                    )}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm text-[#DAA520]">Catatan</label>
                    <p className="font-medium text-[#FFD700]">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      handleViewDateBookings(selectedAppointment);
                      setIsDetailOpen(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-[#FFD700] text-sm font-medium rounded-md text-[#FFD700] bg-[#2d2d2d] hover:bg-[#3d3d3d]">
                    Lihat Tanggal
                  </button>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#1a1a1a] bg-[#FFD700] hover:bg-[#DAA520]">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ringkasan Status */}
        <div className="mt-8">
          <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 border border-[#FFD700]">
            <h3 className="text-lg font-semibold text-[#FFD700] mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ringkasan Status Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#3d3d3d] rounded-lg p-4 border border-[#FFD700]">
                <p className="text-[#DAA520] font-medium">Total Booking</p>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {appointments.length}
                </p>
              </div>
              <div className="bg-[#3d3d3d] rounded-lg p-4 border border-[#FFD700]">
                <p className="text-[#DAA520] font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {
                    appointments.filter(
                      (a) => a.status.toLowerCase() === "confirmed"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-[#3d3d3d] rounded-lg p-4 border border-[#FFD700]">
                <p className="text-[#DAA520] font-medium">Pending</p>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {
                    appointments.filter(
                      (a) => a.status.toLowerCase() === "pending"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-[#3d3d3d] rounded-lg p-4 border border-[#FFD700]">
                <p className="text-[#DAA520] font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {
                    appointments.filter(
                      (a) => a.status.toLowerCase() === "cancelled"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JadwalMUA;
