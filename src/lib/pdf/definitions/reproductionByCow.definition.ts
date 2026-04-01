import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateReproductionByCowPDF } from "../generators/reproduction-by-cow";
import { calculateAgeInMonths, formatDate } from "@/utils/formatDates";

function formatAge(birthDate?: string): string {
  if (!birthDate) return "---";
  const months = calculateAgeInMonths(birthDate);
  if (months < 12) {
    return `${months} meses`;
  }
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (remainder === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  return `${years}a ${remainder}m`;
}

async function generateReproductionByCowReport(
  params: ReportGeneratorParams,
): Promise<void> {
  const { filters } = params;

  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  const animalSelector: any = {
    _deleted: { $eq: false },
    sex: { $eq: "F" },
  };

  if (
    filters.farmIds &&
    filters.farmIds.length > 0 &&
    filters.farmFilterMode !== "all"
  ) {
    animalSelector.farm_id =
      filters.farmIds.length === 1
        ? { $eq: filters.farmIds[0] }
        : { $in: filters.farmIds };
  } else if (filters.farmId && filters.farmFilterMode === "specific") {
    animalSelector.farm_id = { $eq: filters.farmId };
  }

  const animalDocs = await db.animals.find({ selector: animalSelector }).exec();
  const animals = animalDocs.map((doc) => doc.toJSON() as Animal);
  const animalMap = new Map(animals.map((animal) => [animal.rgn, animal]));
  const animalRgns = animals.map((animal) => animal.rgn);

  if (animalRgns.length === 0) {
    await generateReproductionByCowPDF({
      farmName:
        filters.farmNames && filters.farmNames.length > 0
          ? filters.farmNames.join(", ")
          : filters.farmName || "Todas as Fazendas",
      reportDate: new Date().toLocaleDateString("pt-BR"),
      systemName: "Rico Ouro",
      data: [],
    });
    return;
  }

  const eventSelector: any = {
    _deleted: { $eq: false },
    rgn: { $in: animalRgns },
  };

  if (filters.managementDates && filters.managementDates.length > 0) {
    eventSelector.d10_date =
      filters.managementDates.length === 1
        ? { $eq: filters.managementDates[0] }
        : { $in: filters.managementDates };
  } else if (filters.year) {
    eventSelector.d10_date = {
      $gte: `${filters.year}-01-01`,
      $lte: `${filters.year}-12-31`,
    };
  }

  const eventDocs = await db.reproduction_events
    .find({ selector: eventSelector })
    .exec();
  const events = eventDocs.map((doc) => doc.toJSON() as ReproductionEvent);

  const cowMap = new Map<
    string,
    {
      rgn: string;
      birth_date?: string;
      quantity: number;
      d10Dates: Set<string>;
      bullNames: Set<string>;
    }
  >();

  for (const event of events) {
    const existing = cowMap.get(event.rgn);
    if (existing) {
      existing.quantity += 1;
      if (event.d10_date) existing.d10Dates.add(event.d10_date);
      if (event.bull_name) existing.bullNames.add(event.bull_name);
    } else {
      cowMap.set(event.rgn, {
        rgn: event.rgn,
        birth_date: animalMap.get(event.rgn)?.born_date,
        quantity: 1,
        d10Dates: event.d10_date ? new Set([event.d10_date]) : new Set(),
        bullNames: event.bull_name ? new Set([event.bull_name]) : new Set(),
      });
    }
  }

  const data = Array.from(cowMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .map((cow) => ({
      rgn: cow.rgn,
      idade: formatAge(cow.birth_date),
      quantity: cow.quantity,
      d10_dates: Array.from(cow.d10Dates)
        .sort()
        .map((date) => formatDate(date))
        .filter(Boolean)
        .join(", "),
      bull_names: Array.from(cow.bullNames)
        .map((bull) => bull.toUpperCase())
        .join(", "),
    }));

  await generateReproductionByCowPDF({
    farmName:
      filters.farmNames && filters.farmNames.length > 0
        ? filters.farmNames.join(", ")
        : filters.farmName || "Todas as Fazendas",
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: "Rico Ouro",
    data,
  });
}

export const reproductionByCowDefinition: ReportDefinition = {
  id: "reproduction-by-cow",
  title: "Reprodução por Vaca",
  description:
    "Relatório de contagem de eventos reprodutivos por vaca, com datas D10 e touros envolvidos",
  icon: "Heart",
  requiredFilters: [],
  allowColumnSelection: false,
  generate: generateReproductionByCowReport,
};
