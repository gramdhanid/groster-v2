import { useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { PeriodType } from "@/utils/date";
import { getPeriodLabel } from "@/utils/date";

interface DatePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPeriodSelect: (period: PeriodType, startDate: Date, endDate: Date) => void;
  currentPeriod?: PeriodType;
  currentStartDate?: Date;
  currentEndDate?: Date;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "this_week", label: "Minggu Ini" },
  { value: "this_month", label: "Bulan Ini" },
  { value: "custom", label: "Custom Range" },
];

export default function DatePeriodModal({
  isOpen,
  onClose,
  onPeriodSelect,
  currentPeriod = "today",
  currentStartDate,
  currentEndDate,
}: DatePeriodModalProps) {
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodType>(currentPeriod);
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentStartDate,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(currentEndDate);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    if (period !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const handleApply = () => {
    if (selectedPeriod === "custom") {
      if (startDate && endDate) {
        onPeriodSelect(selectedPeriod, startDate, endDate);
      }
    } else {
      onPeriodSelect(selectedPeriod, new Date(), new Date());
    }
    onClose();
  };

  const handleQuickSelect = (period: PeriodType) => {
    handlePeriodChange(period);
    onPeriodSelect(period, new Date(), new Date());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tight">Filter Periode</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Select */}
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Select
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    option.value === "custom"
                      ? handlePeriodChange(option.value)
                      : handleQuickSelect(option.value)
                  }
                  className={`
                                        py-3 px-4 rounded-xl font-bold text-sm transition-all
                                        ${
                                          selectedPeriod === option.value
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }
                                    `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range (only shown when "custom" is selected) */}
          {selectedPeriod === "custom" && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Custom Range
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">
                  Dari
                </label>
                <Popover
                  open={isStartPickerOpen}
                  onOpenChange={setIsStartPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full justify-start text-left font-normal bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition-colors"
                    >
                      <CalendarIcon
                        size={18}
                        className="text-primary flex-shrink-0"
                      />
                      {startDate ? (
                        format(startDate, "PPP", { locale: id })
                      ) : (
                        <span className="text-slate-500">Pilih tanggal</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-slate-700 bg-[#1a1f2e] z-[200]"
                    align="center"
                    sideOffset={8}
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsStartPickerOpen(false);
                      }}
                      initialFocus
                      locale={id}
                      className="bg-[#1a1f2e] text-white"
                      classNames={{
                        day: "text-white hover:bg-slate-700 rounded-lg text-sm w-10 h-10 flex items-center justify-center",
                        day_selected:
                          "bg-primary text-white hover:bg-primary/90 font-bold",
                        day_today:
                          "bg-primary/20 text-[#0f172a] font-bold border-2 border-primary",
                        day_outside: "text-slate-600 opacity-40",
                        day_disabled: "text-slate-600 opacity-30",
                        day_range_middle: "rounded-none",
                        month: "text-white",
                        caption_label: "text-white font-bold",
                        nav_button: "text-white hover:bg-slate-700 rounded-lg",
                        weekday:
                          "text-slate-400 text-xs font-bold py-2 w-10 flex items-center justify-center",
                        head_cell: "w-10 p-0",
                        head_row: "flex w-full",
                        week: "flex w-full",
                        table: "w-full border-collapse",
                        row: "flex w-full",
                      }}
                      formatters={{
                        formatWeekdayName: (date) =>
                          format(date, "EEE", { locale: id }).toUpperCase(),
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">
                  Sampai
                </label>
                <Popover
                  open={isEndPickerOpen}
                  onOpenChange={setIsEndPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full justify-start text-left font-normal bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white rounded-xl px-4 py-3 flex items-center gap-3 transition-colors"
                    >
                      <CalendarIcon
                        size={18}
                        className="text-primary flex-shrink-0"
                      />
                      {endDate ? (
                        format(endDate, "PPP", { locale: id })
                      ) : (
                        <span className="text-slate-500">Pilih tanggal</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-slate-700 bg-[#1a1f2e] z-[200]"
                    align="center"
                    sideOffset={8}
                  >
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setIsEndPickerOpen(false);
                      }}
                      initialFocus
                      locale={id}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      className="bg-[#1a1f2e] text-white"
                      classNames={{
                        day: "text-white hover:bg-slate-700 rounded-lg text-sm w-10 h-10 flex items-center justify-center",
                        day_selected:
                          "bg-primary text-white hover:bg-primary/90 font-bold",
                        day_today:
                          "bg-primary/20 text-[#0f172a] font-bold border-2 border-primary",
                        day_outside: "text-slate-600 opacity-40",
                        day_disabled: "text-slate-600 opacity-30",
                        day_range_middle: "rounded-none",
                        month: "text-white",
                        caption_label: "text-white font-bold",
                        nav_button: "text-white hover:bg-slate-700 rounded-lg",
                        weekday:
                          "text-slate-400 text-xs font-bold py-2 w-10 flex items-center justify-center",
                        head_cell: "w-10 p-0",
                        head_row: "flex w-full",
                        week: "flex w-full",
                        table: "w-full border-collapse",
                        row: "flex w-full",
                      }}
                      formatters={{
                        formatWeekdayName: (date) =>
                          format(date, "EEE", { locale: id }).toUpperCase(),
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Selected Period Display */}
          {selectedPeriod !== "custom" && (
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">
                Periode yang dipilih
              </div>
              <div className="text-lg font-bold text-primary">
                {getPeriodLabel(selectedPeriod)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          {selectedPeriod === "custom" && (
            <button
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Terapkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
