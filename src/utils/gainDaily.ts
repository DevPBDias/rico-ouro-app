// 🔹 Função auxiliar para converter string em Date
export function parseData(dataStr: string): Date {
  if (dataStr.includes("/")) {
    const [dia, mes, ano] = dataStr.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
  } else if (dataStr.includes("-")) {
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }
  throw new Error("Formato de data inválido: " + dataStr);
}

// 🔹 Diferença em dias
export function diferencaEmDias(data1: string, data2: string): number {
  const d1 = parseData(data1);
  const d2 = parseData(data2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// 🔹 Função principal: calcula o ganho diário com base nas pesagens
export function calcularGanhoDiario(
  pesosMedidos?: { mes: string; valor: number }[]
): {
  initialDate: string;
  endDate: string;
  days: number;
  totalGain: number;
  dailyGain: number;
}[] {
  if (!pesosMedidos || pesosMedidos.length < 2) return [];

  const ordenado = [...pesosMedidos].sort(
    (a, b) => parseData(a.mes).getTime() - parseData(b.mes).getTime()
  );

  const ganhos = ordenado.slice(1).map((pAtual, i) => {
    const pAnterior = ordenado[i];

    const days = diferencaEmDias(pAnterior.mes, pAtual.mes);
    const totalGain = pAtual.valor - pAnterior.valor;
    const dailyGain = days > 0 ? totalGain / days : 0;

    return {
      initialDate: pAnterior.mes,
      endDate: pAtual.mes,
      days,
      totalGain: Number(totalGain.toFixed(2)),
      dailyGain: Number(dailyGain.toFixed(3)),
    };
  });

  return ganhos;
}
