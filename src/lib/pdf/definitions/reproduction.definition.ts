import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateReproductionPDF } from "../generators/reproduction";

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "---";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return "---";
  }
}

function calculateAge(birthDate: string | Date | undefined): string {
  if (!birthDate) return "---";
  const date = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  if (isNaN(date.getTime())) return "---";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));

  if (diffMonths < 12) {
    return `${diffMonths} meses`;
  }

  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  if (months === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }

  return `${years}a ${months}m`;
}

async function generateReproductionReport(
  params: ReportGeneratorParams,
): Promise<void> {
  const { filters } = params;

  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  // Fetch farms for mapping farm_id to farm_name
  const farmDocs = await db.farms
    .find({
      selector: { _deleted: { $eq: false } },
    })
    .exec();
  const farms = farmDocs.map((doc) => doc.toJSON());
  const farmMap = new Map(
    farms.map((f: { id: string; farm_name?: string }) => [
      f.id,
      f.farm_name || "",
    ]),
  );

  // Build selector for animals
  const animalSelector: {
    _deleted: { $eq: false };
    sex: { $eq: "F" };
    farm_id?: { $eq: string };
  } = {
    _deleted: { $eq: false },
    // Only female animals for reproduction
    sex: { $eq: "F" },
  };

  // Add farm filter only if farmId is provided and filterMode is "specific"
  if (filters.farmId && filters.farmFilterMode === "specific") {
    animalSelector.farm_id = { $eq: filters.farmId };
  }

  // Add animal_state filter only if animalStateFilterMode is "specific"
  if (
    filters.animalState &&
    filters.animalStateFilterMode === "specific" &&
    filters.animalState !== "Ambos"
  ) {
    // @ts-ignore
    animalSelector.animal_state = { $eq: filters.animalState };
  }

  // Fetch animals from the selected farm(s)
  const animalDocs = await db.animals
    .find({
      selector: animalSelector,
    })
    .exec();

  const animals = animalDocs.map((doc) => doc.toJSON() as Animal);
  const animalRgns = animals.map((a) => a.rgn);

  // For reproduction report, show farm column when no specific farm is selected
  const showFarmColumn = !filters.farmId || filters.farmFilterMode === "all";

  // Create animal lookup map including farm_id
  const animalMap = new Map(
    animals.map((a) => [
      a.rgn,
      { ...a, farmName: farmMap.get(a.farm_id || "") || "---" },
    ]),
  );

  // Fetch reproduction events
  // If no date range, we fetch all active events
  const selector: {
    _deleted: { $eq: false };
    rgn: { $in: string[] };
    d0_date?: {
      $gte?: string;
      $lte?: string;
    };
  } = {
    _deleted: { $eq: false },
    rgn: { $in: animalRgns },
  };

  if (filters.startDate || filters.endDate) {
    selector.d0_date = {};
    if (filters.startDate) selector.d0_date.$gte = filters.startDate;
    if (filters.endDate) selector.d0_date.$lte = filters.endDate;
  }

  const eventDocs = await db.reproduction_events
    .find({
      selector,
      sort: [{ rgn: "asc" as const }],
    })
    .exec();

  const events = eventDocs.map((doc) => doc.toJSON() as ReproductionEvent);

  // Transform data for report
  const reportData = {
    farmName: filters.farmName || "Todas as Fazendas",
    showFarmColumn,
    managementDate: filters.managementDates?.length
      ? filters.managementDates.map((d) => formatDate(d)).join(", ")
      : "---",
    data: events
      .filter((event) => {
        // Only include events from selected management dates
        if (!filters.managementDates || filters.managementDates.length === 0)
          return true;
        return filters.managementDates.includes(event.d0_date);
      })
      .map((event) => {
        const animal = animalMap.get(event.rgn);
        return {
          rgn: event.rgn || "---",
          farmName: showFarmColumn ? animal?.farmName || "---" : undefined,
          idade: calculateAge(animal?.born_date),
          classification: animal?.classification || "---",
          bull_name: event.bull_name || "---",
          d0_date: formatDate(event.d0_date),
          d8_date: formatDate(event.d8_date),
          d10_date: formatDate(event.d10_date),
          resync_bull: event.resync_bull || "---",
          resync_d0: formatDate(event.d22_date), // resync d0 is mapped from d22
          resync_d8: formatDate(event.d30_date), // resync d8 is mapped from d30
          diagnostic_d30: event.diagnostic_d30 || "---",
          resync_d10: formatDate(event.d32_date), // resync d10 is mapped from d32
        };
      }),
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: "Rico Ouro",
  };

  await generateReproductionPDF(reportData);
}

export const reproductionDefinition: ReportDefinition = {
  id: "reproduction",
  title: "Reprodução",
  description:
    "Lista os eventos de manejo reprodutivo dos animais (de uma fazenda específica ou todas) em um período",
  icon: "Heart",
  requiredFilters: ["managementDates"], // farm é opcional agora
  allowColumnSelection: false,
  generate: generateReproductionReport,
};
