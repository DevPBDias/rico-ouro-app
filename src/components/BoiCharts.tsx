"use client";

import { CartesianGrid, LabelList, Line, LineChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { FormatData } from "@/utils/formatDates";

type SerieItem = { mes: string; valor: number };

type Props = {
  title: string;
  description?: string;
  data: SerieItem[];
  colorVar?: string;
};

export function ChartLineLabel({
  title,
  description,
  data,
  colorVar = "--chart-1",
}: Props) {
  const sortedData = [...data].sort((a, b) => {
    if (a.mes.includes("-") && b.mes.includes("-")) {
      return a.mes.localeCompare(b.mes);
    }
    return 0;
  });

  const chartData = sortedData.map((d) => ({
    month: d.mes,
    label: FormatData(d.mes),
    value: d.valor,
  }));

  const chartConfig = {
    value: {
      label: title,
      color: `var(${colorVar})`,
    },
  } satisfies ChartConfig;

  const unit = title.toLowerCase().includes("peso") ? "kg" : "cm";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 30,
              left: 20,
              right: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <Line
              dataKey="value"
              type="monotone"
              stroke={chartConfig.value.color}
              strokeWidth={2}
              dot={{
                fill: chartConfig.value.color,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                dataKey="value"
                formatter={(value: number) => `${value}${unit}`}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
