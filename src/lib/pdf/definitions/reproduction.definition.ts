import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateReproductionPDF } from "../generators/reproduction";

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "---";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch (e) {
    return "---";
  }
}

function calculateAge(bornDate: string | undefined): string {
  if (!bornDate) return "---";
  const birthDate = new Date(bornDate);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  return `${months} ${months === 1 ? "mês" : "meses"}`;
}

async function generateReproductionReport(
  params: ReportGeneratorParams
): Promise<void> {
  const { filters } = params;

  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  // Fetch animals from the selected farm
  const animalDocs = await db.animals
    .find({
      selector: {
        _deleted: { $eq: false },
        farm_id: { $eq: filters.farmId },
        // Only female animals for reproduction
        sex: { $eq: "F" },
      },
    })
    .exec();

  const animals = animalDocs.map((doc) => doc.toJSON() as Animal);
  const animalRgns = animals.map((a) => a.rgn);

  // Fetch reproduction events
  // If no date range, we fetch all active events
  const selector: any = {
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

  // Create animal lookup map
  const animalMap = new Map(animals.map((a) => [a.rgn, a]));

  // Transform data for report
  const reportData = {
    farmName: filters.farmName || "Fazenda",
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
          idade: calculateAge(animal?.born_date),
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
    "Lista os eventos de manejo reprodutivo dos animais em um período",
  icon: "Heart",
  requiredFilters: ["farm", "managementDates"],
  allowColumnSelection: false,
  generate: generateReproductionReport,
};
