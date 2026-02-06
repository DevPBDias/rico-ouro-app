"use client";

import { useSales } from "@/hooks/db/sales/useSales";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];

export function SalesDetails() {
  const { allSales, isLoading, availableYears } = useSales();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Doughnut chart data: sales by month for selected year
  const doughnutData = useMemo(() => {
    const monthlyData = Array(12).fill(0);

    allSales.forEach((sale) => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === selectedYear) {
        const month = saleDate.getMonth();
        monthlyData[month] += 1;
      }
    });

    return monthlyData.map((count, idx) => ({
      name: MONTHS_SHORT[idx],
      value: count,
      isCurrent: idx === currentMonth && selectedYear === currentYear,
    }));
  }, [allSales, selectedYear, currentMonth, currentYear]);

  const totalSalesYear = doughnutData.reduce((sum, d) => sum + d.value, 0);

  // Bar chart data: last 3 years comparison
  const barData = useMemo(() => {
    const years = [currentYear - 2, currentYear - 1, currentYear];

    return years.map((year) => {
      const yearSales = allSales.filter(
        (s) => new Date(s.date).getFullYear() === year,
      );
      const totalValue = yearSales.reduce(
        (sum, s) => sum + (s.total_value || 0),
        0,
      );
      const count = yearSales.length;

      return {
        year: String(year),
        animais: count,
        valor: totalValue,
      };
    });
  }, [allSales, currentYear]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const chartConfig = {
    animais: { label: "Animais", color: "#3B82F6" },
    valor: { label: "Valor (R$)", color: "#60A5FA" },
  };

  return (
    <div className="space-y-6">
      {/* Doughnut Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase text-primary">
            Vendas no ano
          </h3>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0
                ? availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))
                : [currentYear - 2, currentYear - 1, currentYear].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <ChartContainer config={chartConfig} className="h-48 w-48">
              <PieChart>
                <Pie
                  data={doughnutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {doughnutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCurrent ? "#1D4ED8" : COLORS[index % 4]}
                      stroke={entry.isCurrent ? "#1E40AF" : "transparent"}
                      strokeWidth={entry.isCurrent ? 3 : 0}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">
                  {totalSalesYear}
                </p>
                <p className="text-xs text-muted-foreground">Vendas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - 3 Year Comparison */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase text-primary mb-4">
          Comparativo dos últimos 3 anos
        </h3>

        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart data={barData}>
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="animais" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
          {barData.map((item) => (
            <div key={item.year}>
              <p className="font-bold text-primary">{item.animais}</p>
              <p className="text-xs text-muted-foreground">
                animais em {item.year}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
