"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type SerieItem = { mes: string; valor: number };

type Props = {
  title: string;
  description?: string;
  data: SerieItem[];
  colorVar?: string; // e.g. --chart-1
};

export function ChartBarLabel({ title, description, data, colorVar = "--chart-1" }: Props) {
  const formatMes = (s: string) => {
    // Se já é um nome de mês personalizado (não contém "-"), retorna como está
    if (!s.includes("-")) {
      return s;
    }
    
    // Se é formato YYYY-MM, converte para MM/YYYY
    const [y, m] = String(s).split("-");
    if (y && m) {
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      const monthIndex = parseInt(m) - 1;
      return monthIndex >= 0 && monthIndex < 12 
        ? `${monthNames[monthIndex]}/${y.slice(-2)}` 
        : `${m}/${y.slice(-2)}`;
    }
    
    return String(s);
  };

  // Ordena os dados por data para melhor visualização
  const sortedData = [...data].sort((a, b) => {
    // Se ambos são formato YYYY-MM, ordena por data
    if (a.mes.includes("-") && b.mes.includes("-")) {
      return a.mes.localeCompare(b.mes);
    }
    // Se são nomes personalizados, mantém ordem de inserção
    return 0;
  });

  const chartData = sortedData.map((d) => ({ 
    month: d.mes, 
    label: formatMes(d.mes), 
    value: d.valor 
  }));

  const chartConfig = {
    value: {
      label: title,
      color: `var(${colorVar})`,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 30, left: 4, right: 4, bottom: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              tickFormatter={(value: string) => formatMes(value)}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              tickMargin={6}
              hide={true}
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value: unknown) => {
                  const unit = title.toLowerCase().includes('peso') ? 'kg' : 'cm';
                  return [`${value}${unit}`];
                }}
                labelFormatter={(value) => `Mês: ${formatMes(value)}`}
              />}
            />
            <Bar dataKey="value" fill={`var(${colorVar})`} radius={6} barSize={16}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={11}
                dataKey="value"
                formatter={(value: number) => {
                  const unit = title.toLowerCase().includes('peso') ? 'kg' : 'cm';
                  return `${value}${unit}`;
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


