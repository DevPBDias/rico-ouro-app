"use client";

import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Sale } from "@/types/sale.type";
import { useMemo, useState } from "react";
import type { MangoQuery } from "rxdb";

/**
 * Hook reativo para gerenciar a lista de vendas.
 * Oferece busca, filtragem e operações CRUD básicas.
 */
export function useSales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | null>(
    null,
  );

  const query = useMemo<MangoQuery<Sale>>(() => {
    const baseSelector: any = { _deleted: { $eq: false } };

    if (searchQuery) {
      baseSelector.$or = [
        { animal_rgn: { $regex: searchQuery, $options: "i" } },
        { gta_number: { $regex: searchQuery, $options: "i" } },
        { invoice_number: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (clientFilter) {
      baseSelector.client_id = { $eq: clientFilter };
    }

    if (paymentMethodFilter) {
      baseSelector.payment_method = { $eq: paymentMethodFilter };
    }

    return {
      selector: baseSelector,
      sort: [{ date: "desc" } as any],
    };
  }, [searchQuery, clientFilter, paymentMethodFilter]);

  const {
    data: allSales,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useLocalQuery<Sale>("sales", query);

  if (allSales && allSales.length > 0) {
    console.log(`📊 [useSales] Loaded ${allSales.length} sales from local DB`);
  }

  // Filter by year and month after fetching (RxDB date handling)
  const sales = useMemo(() => {
    if (!allSales) return [];

    return allSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      if (yearFilter && saleDate.getFullYear() !== yearFilter) return false;
      if (monthFilter && saleDate.getMonth() + 1 !== monthFilter) return false;
      return true;
    });
  }, [allSales, yearFilter, monthFilter]);

  const {
    create,
    update,
    remove,
    isLoading: isMutationLoading,
    error: mutationError,
  } = useLocalMutation<Sale>("sales");

  // Helper to get unique years from sales data
  const availableYears = useMemo(() => {
    if (!allSales) return [];
    const years = new Set(
      allSales.map((sale) => new Date(sale.date).getFullYear()),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [allSales]);

  return {
    sales: sales || [],
    allSales: allSales || [],
    isLoading: isQueryLoading || isMutationLoading,
    error: queryError || mutationError,
    createSale: create,
    updateSale: update,
    deleteSale: remove,
    searchSales: setSearchQuery,
    setYearFilter,
    setMonthFilter,
    setClientFilter,
    setPaymentMethodFilter,
    availableYears,
    refetch,
  };
}
