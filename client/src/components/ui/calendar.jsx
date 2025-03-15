import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/tailwind-utils";

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
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
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
              "h-10 w-10 rounded-lg text-[#DAA520]",
              "hover:bg-[#3d3d3d] hover:text-[#FFD700]",
              "focus:bg-[#3d3d3d] focus:text-[#FFD700] focus:outline-none",
              isToday && "border border-[#FFD700] text-[#FFD700]",
              isSelected &&
                "bg-[#FFD700] text-[#1a1a1a] hover:bg-[#DAA520] hover:text-[#1a1a1a]",
              isInRange && "bg-[#3d3d3d]",
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
          "p-4 bg-[#2d2d2d] rounded-lg border border-[#FFD700] shadow-lg",
          className
        )}
        {...props}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-[#3d3d3d] rounded-lg text-[#DAA520]"
            disabled={disabled}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="font-semibold text-[#FFD700]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-[#3d3d3d] rounded-lg text-[#DAA520]"
            disabled={disabled}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-10 w-10 flex items-center justify-center text-sm font-medium text-[#DAA520]">
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

export { Calendar };
