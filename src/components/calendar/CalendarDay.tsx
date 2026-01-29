"use client";

import { useMemo } from "react";
import { STAGE_METADATA, CalendarEvent } from "@/types/calendar.types";

interface CalendarDayProps {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onClick: (date: Date, events: CalendarEvent[]) => void;
}

export function CalendarDay({
  day,
  date,
  isCurrentMonth,
  isToday,
  events,
  onClick,
}: CalendarDayProps) {
  const groupedDayEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent> = {};

    events.forEach((event) => {
      const key = `${event.color}-${event.stage}`;
      if (!groups[key]) {
        groups[key] = event;
      }
    });

    return Object.values(groups);
  }, [events]);

  return (
    <div
      onClick={() => onClick(date, events)}
      className={`min-h-[85px] p-2 border-r border-b transition-colors cursor-pointer hover:bg-muted/30 flex flex-col gap-1 ${
        isCurrentMonth ? "bg-background" : "bg-muted/20 text-muted-foreground"
      } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-[13px] font-black ${isToday ? "text-primary" : "text-muted-foreground/70"}`}
        >
          {day}
        </span>
      </div>

      <div className="flex flex-col gap-1 mt-0.5 overflow-hidden">
        {groupedDayEvents.slice(0, 3).map((group, idx) => {
          return (
            <div
              key={`${group.eventId}-${group.stage}-${idx}`}
              className="w-full rounded-md px-2 py-1 flex items-center justify-center shadow-sm"
              style={{ backgroundColor: group.color }}
            >
              <span className="text-xs font-bold uppercase leading-none text-white tracking-widest">
                {group.stage}
              </span>
            </div>
          );
        })}
        {groupedDayEvents.length > 3 && (
          <span className="text-[9px] font-bold text-muted-foreground text-center">
            +{groupedDayEvents.length - 3} mais
          </span>
        )}
      </div>
    </div>
  );
}
