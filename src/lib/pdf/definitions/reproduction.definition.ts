import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateReproductionPDF } from "../generators/reproduction";
import {
  REPRODUCTION_REPORT_AVAILABLE_COLUMNS,
  REPRODUCTION_DEFAULT_COLUMNS,
} from "./availableColumns";

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

  // Fetch reproduction events within date range
  const eventDocs = await db.reproduction_events
    .find({
      selector: {
        _deleted: { $eq: false },
        rgn: { $in: animalRgns },
        d0_date: {
          $gte: filters.startDate || "",
          $lte: filters.endDate || new Date().toISOString().split("T")[0],
        },
      },
      sort: [{ d0_date: "desc" as const }],
    })
    .exec();

  const events = eventDocs.map((doc) => doc.toJSON() as ReproductionEvent);

  // Create animal lookup map
  const animalMap = new Map(animals.map((a) => [a.rgn, a]));

  // Transform data for report
  const reportData = {
    farmName: filters.farmName || "Fazenda",
    managementDate: filters.startDate
      ? new Date(filters.startDate).toLocaleDateString("pt-BR")
      : new Date().toLocaleDateString("pt-BR"),
    data: events.map((event) => {
      const animal = animalMap.get(event.rgn);
      return {
        rgd: animal?.serie_rgd || "",
        rgn: event.rgn || "",
        animalName: animal?.name || "---",
        managementType: formatEventType(event),
        date: event.d0_date
          ? new Date(event.d0_date).toLocaleDateString("pt-BR")
          : "---",
        body_score: event.body_score || "---",
        cycle_stage: event.cycle_stage || "---",
        ovary_size: event.ovary_size || "---",
        ovary_structure: event.ovary_structure || "---",
        protocol_name: event.protocol_name || "---",
        bull_name: event.bull_name || "---",
        resync_bull: event.resync_bull || "---",
        natural_mating_bull: event.natural_mating_bull || "---",
        diagnostic_d30: event.diagnostic_d30 || "---",
        final_diagnostic: event.final_diagnostic || "---",
        observations: event.bull_name ? `Touro: ${event.bull_name}` : "---",
      };
    }),
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: "Rico Ouro",
  };

  const selectedColumns =
    filters.selectedColumns && filters.selectedColumns.length > 0
      ? [...filters.selectedColumns]
      : [...REPRODUCTION_DEFAULT_COLUMNS];

  await generateReproductionPDF(reportData, selectedColumns);
}

function formatEventType(event: ReproductionEvent): string {
  const type = event.event_type === "IATF" ? "IATF" : "FIV";

  if (event.final_diagnostic) {
    return `${type} - ${
      event.final_diagnostic === "prenha" ? "Prenha" : "Vazia"
    }`;
  }

  if (event.diagnostic_d30) {
    return `${type} - DG30: ${
      event.diagnostic_d30 === "prenha" ? "Prenha" : "Vazia"
    }`;
  }

  return type;
}

export const reproductionDefinition: ReportDefinition = {
  id: "reproduction",
  title: "Reprodução",
  description:
    "Lista os eventos de manejo reprodutivo dos animais em um período",
  icon: "Heart",
  requiredFilters: ["farm", "dateRange"],
  allowColumnSelection: true,
  generate: generateReproductionReport,
};
