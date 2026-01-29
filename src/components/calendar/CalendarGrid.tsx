"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/calendar.types";

interface CalendarGridProps {
  events: CalendarEvent[];
  onDayClick: (date: Date, events: CalendarEvent[]) => void;
}

export function CalendarGrid({ events, onDayClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end }).map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayEvents = events.filter((e) => e.date === dateStr);

      return {
        date,
        events: dayEvents,
        isCurrentMonth: isSameMonth(date, currentMonth),
        isTodayDay: isToday(date),
      };
    });
  }, [currentMonth, events]);

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header de Navegação */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-primary w-5 h-5" />
          <h2 className="text-lg font-black uppercase tracking-tighter text-primary">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Grid de Dias da Semana */}
      <div className="grid grid-cols-7 border-b bg-muted/5">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center border-r last:border-0">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 border-l">
        {days.map((day, idx) => (
          <CalendarDay
            key={day.date.toString()}
            day={day.date.getDate()}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isTodayDay}
            events={day.events}
            onClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}
