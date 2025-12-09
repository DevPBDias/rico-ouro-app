import { AnimalMetric } from "@/types/animal_metrics.type";
import { formatDate } from "@/utils/formatDates";
import InfoSection from "../layout/InfoSection";
import InfoRow from "../layout/InfoRow";

interface GainDaily {
  dailyGain: number;
  days: number;
  endDate: string;
  initialDate: string;
  totalGain: number;
}

interface WeightListProps {
  weightData: Partial<AnimalMetric>[];
  gainDaily: GainDaily[];
}

export function DetailsWeightList({ weightData, gainDaily }: WeightListProps) {
  function diferencaEmDias(data1: string, data2: string): number {
    const [dia1, mes1, ano1] = data1.split("/").map(Number);
    const [dia2, mes2, ano2] = data2.split("/").map(Number);

    const d1 = new Date(ano1, mes1 - 1, dia1);
    const d2 = new Date(ano2, mes2 - 1, dia2);

    const diffEmMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
  }

  const valueInteval = (i: number): string => {
    if (i === 0) return "0";

    const currentDate = weightData[i].date;
    const previousDate = weightData[i - 1].date;

    if (!currentDate || !previousDate) return "0";

    const days = diferencaEmDias(currentDate, previousDate);
    return String(days);
  };

  const valueGmd = (i: number): string => {
    if (i === 0) return "0";

    const entry = gainDaily.find((g) => g.endDate === weightData[i].date);
    if (!entry) return "0";
    return String(entry.dailyGain);
  };

  return (
    <div className="space-y-4 mt-6">
      {weightData?.map((p, i) => (
        <InfoSection
          key={i}
          title={i === 0 ? "Peso Nascimento" : `${i}° Pesagem`}
        >
          <InfoRow label="Data" value={formatDate(p.date)} />
          <InfoRow label="Peso (kg)" value={p.value} />
          <InfoRow label="Intervalo (dias)" value={valueInteval(i)} />
          <InfoRow label="GMD (kg/dia)" value={valueGmd(i)} />
        </InfoSection>
      ))}
    </div>
  );
}
