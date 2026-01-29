"use client";

import { usePathname, useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

export function CalendarNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide the button if already on the calendar page or on the login page
  const isCalendarPage = pathname === "/calendario";
  const isLoginPage = pathname === "/login" || pathname === "/";

  if (isCalendarPage || isLoginPage) {
    return null;
  }

  return (
    <div className="fixed z-[100] top-4 left-2">
      <button
        onClick={() => router.push("/calendario")}
        className="flex items-center justify-center bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full p-2.5 shadow-xl hover:bg-slate-800 transition-all border-b-2 border-b-white/5 active:scale-95 group"
        title="Ver Calendário"
      >
        <Calendar size={18} className="text-white group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
