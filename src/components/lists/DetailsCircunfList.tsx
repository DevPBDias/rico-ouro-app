"use client";

interface CEMedido {
  valor: number;
  mes: string;
}

interface DetailsCircunfListProps {
  CEMedidos: CEMedido[];
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
    const days = diferencaEmDias(CEMedidos[i].mes, CEMedidos[i - 1].mes);
    return String(days);
  };

  const valueDailyChange = (i: number): string => {
    if (i === 0) return "0";
    const current = CEMedidos[i];
    const previous = CEMedidos[i - 1];
    const days = diferencaEmDias(current.mes, previous.mes);
    if (days <= 0) return "0";
    const totalGain = current.valor - previous.valor;
    const daily = totalGain / days;
    return daily.toFixed(3);
  };

  return (
    <div className="space-y-4 mt-6">
      {CEMedidos?.map((p, i) => (
        <div
          key={i}
          className="flex items-start justify-between border rounded-xl p-3 bg-white shadow-sm"
        >
          <div className="flex flex-col items-start gap-3 uppercase">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400">
                {i === 0 ? "Medição Nascimento" : `${i}ª Medição`}
              </span>
              <span className="text-xs font-medium text-primary">{p.mes}</span>
            </div>
            <div className="text-xl mt-4 font-bold text-[#1162AE] flex flex-row items-center  gap-1">
              {p.valor}
              <span className="text-xs">cm</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400 uppercase">
                intervalo (dias)
              </span>
              <span className="uppercase text-sm font-bold text-primary">
                {valueInterval(i)}
              </span>
            </div>
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400 uppercase">
                Aumento/dia
              </span>
              <span className="uppercase text-sm font-bold text-[#1162AE]">
                {valueDailyChange(i)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
