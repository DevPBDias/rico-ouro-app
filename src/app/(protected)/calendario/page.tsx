"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { CalendarEventModal } from "@/components/calendar/CalendarEventModal";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { CalendarEvent, EventStage } from "@/types/calendar.types";
import { Loader2 } from "lucide-react";

const CYCLE_COLORS = [
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#06B6D4", // Cyan
];

export default function CalendarPage() {
  const { events, isLoading } = useReproductionEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map each unique D0 date to a specific color
  const cycleColorMap = useMemo(() => {
    const uniqueD0Dates = Array.from(
      new Set(events.map((e) => e.d0_date).filter(Boolean)),
    ).sort();

    const mapping: Record<string, string> = {};
    uniqueD0Dates.forEach((date, index) => {
      mapping[date!] = CYCLE_COLORS[index % CYCLE_COLORS.length];
    });
    return mapping;
  }, [events]);

  const activeCycles = useMemo(() => {
    return Object.entries(cycleColorMap).map(([date, color]) => ({
      date,
      color,
    }));
  }, [cycleColorMap]);

  const formattedEvents = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    events.forEach((event) => {
      const stages: { stage: EventStage; date?: string; bull?: string }[] = [
        { stage: "D0", date: event.d0_date, bull: event.bull_name },
        { stage: "D8", date: event.d8_date },
        { stage: "D10", date: event.d10_date, bull: event.bull_name },
        { stage: "D22", date: event.d22_date },
        { stage: "D30", date: event.d30_date },
        { stage: "D32", date: event.d32_date, bull: event.resync_bull },
        { stage: "D110", date: event.d110_date },
        {
          stage: "D35",
          date: event.natural_mating_d35_entry,
          bull: event.natural_mating_bull,
        },
        {
          stage: "D80",
          date: event.natural_mating_d80_exit,
          bull: event.natural_mating_bull,
        },
      ];

      // Handle D11 specifics (D9, D11, D23, D34, D37, D82)
      const isD11 = event.protocol_name === "Sync D11";

      stages.forEach((s) => {
        if (!s.date) return;

        let finalStage = s.stage;
        if (isD11) {
          if (s.stage === "D8") finalStage = "D9";
          if (s.stage === "D10") finalStage = "D11";
          if (s.stage === "D22") finalStage = "D23";
          if (s.stage === "D32") finalStage = "D34";
          if (s.stage === "D35") finalStage = "D37";
          if (s.stage === "D80") finalStage = "D82";
        }

        calendarEvents.push({
          eventId: event.event_id,
          rgn: event.rgn,
          animalName: "", // We could fetch name if needed, but RGN is primary
          stage: finalStage,
          date: s.date,
          protocolName: event.protocol_name || "IATF",
          eventType: event.event_type,
          bullName: s.bull,
          color: event.d0_date ? cycleColorMap[event.d0_date] : "#3B82F6",
        });
      });
    });

    return calendarEvents;
  }, [events]);

  const handleDayClick = (date: Date, evs: CalendarEvent[]) => {
    setSelectedDate(date);
    setDayEvents(evs);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header title="Calendário de Manejo" />

      <main className="flex-1 px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Carregando Calendário...
            </p>
          </div>
        ) : (
          <>
            <CalendarGrid
              events={formattedEvents}
              onDayClick={handleDayClick}
            />

            <CalendarLegend activeCycles={activeCycles} />
          </>
        )}
      </main>

      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        events={dayEvents}
      />
    </div>
  );
}
