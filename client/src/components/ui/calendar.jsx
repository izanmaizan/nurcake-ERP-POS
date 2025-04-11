// calendar.jsx
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/tailwind-utils";

// Warna tema krem/emas
const COLORS = {
  bgColor: "#FAF3E0", // Krem muda/background utama
  textColor: "#8B7D3F", // Emas gelap untuk teks
  secondaryTextColor: "#B8A361", // Emas sedang untuk teks sekunder
  cardBgColor: "#FFF8E7", // Krem sangat muda untuk kartu
  accentColor: "#D4AF37", // Emas utama (accent)
  accentLight: "#E6BE8A", // Emas muda
  accentMedium: "#C5B358", // Emas sedang
};

const API = import.meta.env.VITE_API;

const Calendar = React.forwardRef(
    (
        {
          className,
          classNames,
          mode = "single",
          selected,
          onSelect,
          disabled,
          ...props
        },
        ref
    ) => {
      const [currentDate, setCurrentDate] = React.useState(new Date());
      const [selectedDates, setSelectedDates] = React.useState({
        from: selected?.from || selected,
        to: selected?.to,
      });

      const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
      ).getDate();

      const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
      ).getDay();

      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      const goToPreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.setMonth(currentDate.getMonth() - 1))
        );
      };

      const goToNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.setMonth(currentDate.getMonth() + 1))
        );
      };

      const isDateSelected = (date) => {
        if (mode === "single") {
          return (
              selectedDates.from &&
              date.toDateString() === selectedDates.from.toDateString()
          );
        }

        if (mode === "range" && selectedDates.from && selectedDates.to) {
          return date >= selectedDates.from && date <= selectedDates.to;
        }

        return false;
      };

      const isDateInRange = (date) => {
        if (mode !== "range" || !selectedDates.from || !selectedDates.to)
          return false;
        return date > selectedDates.from && date < selectedDates.to;
      };

      const handleDateSelect = (date) => {
        if (disabled) return;

        if (mode === "single") {
          setSelectedDates({ from: date, to: null });
          onSelect?.(date);
        } else if (mode === "range") {
          if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
            setSelectedDates({ from: date, to: null });
            onSelect?.({ from: date, to: null });
          } else {
            const newRange =
                date < selectedDates.from
                    ? { from: date, to: selectedDates.from }
                    : { from: selectedDates.from, to: date };
            setSelectedDates(newRange);
            onSelect?.(newRange);
          }
        }
      };

      const renderDays = () => {
        const days = [];
        const today = new Date();

        // Isi hari-hari kosong sebelum hari pertama bulan
        for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(<div key={`empty-${i}`} className="h-8 w-8 md:h-10 md:w-10" />);
        }

        // Isi hari-hari dalam bulan
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
          );
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);

          days.push(
              <button
                  key={day}
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                      "h-8 w-8 md:h-10 md:w-10 rounded-lg text-[#8B7D3F]",
                      "hover:bg-[#FAF3E0] hover:text-[#D4AF37]",
                      "focus:bg-[#FAF3E0] focus:text-[#D4AF37] focus:outline-none",
                      isToday && "border border-[#D4AF37] text-[#8B7D3F]",
                      isSelected &&
                      "bg-[#D4AF37] text-white hover:bg-[#C5B358] hover:text-white",
                      isInRange && "bg-[#FAF3E0]",
                      disabled && "opacity-50 cursor-not-allowed",
                      classNames?.day
                  )}>
                {day}
              </button>
          );
        }

        return days;
      };

      return (
          <div
              ref={ref}
              className={cn(
                  "p-2 sm:p-3 md:p-4 bg-[#FFF8E7] rounded-lg border border-[#D4AF37] shadow-lg",
                  "w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto",
                  className
              )}
              {...props}>
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <button
                  onClick={goToPreviousMonth}
                  className="p-1 md:p-2 hover:bg-[#FAF3E0] rounded-lg text-[#B8A361]"
                  disabled={disabled}>
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </button>
              <div className="font-semibold text-sm md:text-base text-[#8B7D3F]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button
                  onClick={goToNextMonth}
                  className="p-1 md:p-2 hover:bg-[#FAF3E0] rounded-lg text-[#B8A361]"
                  disabled={disabled}>
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 md:mb-2">
              {dayNames.map((day) => (
                  <div
                      key={day}
                      className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-xs md:text-sm font-medium text-[#B8A361]">
                    {day}
                  </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
          </div>
      );
    }
);

Calendar.displayName = "Calendar";

export { Calendar, COLORS, API };