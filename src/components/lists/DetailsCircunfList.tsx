"use client";

import { AnimalMetric } from "@/types/animal_metrics.type";
import InfoSection from "../layout/InfoSection";
import InfoRow from "../layout/InfoRow";
import { formatDate } from "@/utils/formatDates";

interface DetailsCircunfListProps {
  CEMedidos: AnimalMetric[];
}

export function DetailsCircunfList({ CEMedidos }: DetailsCircunfListProps) {
  function diferencaEmDias(data1: string, data2: string): number {
    const [dia1, mes1, ano1] = data1.split("/").map(Number);
    const [dia2, mes2, ano2] = data2.split("/").map(Number);

    const d1 = new Date(ano1, mes1 - 1, dia1);
    const d2 = new Date(ano2, mes2 - 1, dia2);

    const diffEmMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
  }

  const valueInterval = (i: number): string => {
    if (i === 0) return "0";
    const days = diferencaEmDias(CEMedidos[i].date, CEMedidos[i - 1].date);
    return String(days);
  };

  const valueDailyChange = (i: number): string => {
    if (i === 0) return "0";
    const current = CEMedidos[i];
    const previous = CEMedidos[i - 1];
    const days = diferencaEmDias(current.date, previous.date);
    if (days <= 0) return "0";
    const totalGain = current.value - previous.value;
    const daily = totalGain / days;
    return daily.toFixed(3);
  };

  return (
    <div className="space-y-4 mt-6">
      {CEMedidos?.map((p, i) => (
        <InfoSection
          key={i}
          title={i === 0 ? "Peso Nascimento" : `${i}° Pesagem`}
        >
          <InfoRow label="Data" value={formatDate(p.date)} />
          <InfoRow label="Circunferência (cm)" value={p.value} />
          <InfoRow label="Intervalo (dias)" value={valueInterval(i)} />
          <InfoRow label="GMD (cm/dia)" value={valueDailyChange(i)} />
        </InfoSection>
      ))}
    </div>
  );
}
