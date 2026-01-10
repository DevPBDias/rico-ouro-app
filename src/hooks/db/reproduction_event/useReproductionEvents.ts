"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export function useReproductionEvents(rgn?: string) {
  const { db, isLoading: dbLoading } = useRxDB();
  const [events, setEvents] = useState<ReproductionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const query = db.reproduction_events.find({
      selector: {
        _deleted: { $eq: false },
        ...(rgn ? { rgn: { $eq: rgn } } : {}),
      },
      sort: [{ d0_date: "desc" }],
    });

    const subscription = query.$.subscribe({
      next: (docs) => {
        console.log(`📦 [RxDB] Events for RGN ${rgn}:`, docs.length);
        if (docs.length > 0) {
          console.log(`📄 Sample Event RGN: "${docs[0].rgn}"`);
        }
        const data = docs.map((doc) => doc.toJSON() as ReproductionEvent);
        setEvents(data);
        setIsLoading(false);
      },
      error: (err) => {
        setError(err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [db, dbLoading, rgn]);

  return {
    events,
    isLoading,
    error,
  };
}
