import { AnimalMetric } from "@/types/animal_metrics.type";
import { formatDate } from "@/utils/formatDates";

interface GainDaily {
  dailyGain: number;
  days: number;
  endDate: string;
  initialDate: string;
  totalGain: number;
}

interface WeightListProps {
  pesosMedidos: Partial<AnimalMetric>[];
  gainDaily: GainDaily[];
}

export function DetailsWeightList({
  pesosMedidos,
  gainDaily,
}: WeightListProps) {
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

    const currentDate = pesosMedidos[i].date;
    const previousDate = pesosMedidos[i - 1].date;

    if (!currentDate || !previousDate) return "0";

    const days = diferencaEmDias(currentDate, previousDate);
    return String(days);
  };

  const valueGmd = (i: number): string => {
    if (i === 0) return "0";

    const entry = gainDaily.find((g) => g.endDate === pesosMedidos[i].date);
    if (!entry) return "0";
    return String(entry.dailyGain);
  };

  return (
    <div className="space-y-4 mt-6">
      {pesosMedidos?.map((p, i) => (
        <div
          key={i}
          className="flex items-start justify-between border rounded-xl p-3 bg-white shadow-sm"
        >
          <div className="flex flex-col items-start gap-3 uppercase">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400">
                {i === 0 ? "Peso Nascimento" : `${i}° Pesagem`}
              </span>
              <span className="text-xs font-medium text-primary">
                {formatDate(p.date)}
              </span>
            </div>
            <div className="text-xl mt-4 font-bold text-[#1162AE] flex flex-row items-center  gap-1">
              {p.value}
              <span className="text-xs font-medium text-gray-400 lowercase">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400 uppercase">
                intervalo (dias)
              </span>
              <span className="uppercase text-sm font-bold text-primary">
                {valueInteval(i)}
              </span>
            </div>
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400 uppercase">
                gmd
              </span>
              <span className="uppercase text-sm font-bold text-[#1162AE]">
                {valueGmd(i)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
