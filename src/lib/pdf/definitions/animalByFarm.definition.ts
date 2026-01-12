import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateAnimalsByFarmPDF } from "../generators/animals-by-farm";
import {
  ANIMAL_REPORT_AVAILABLE_COLUMNS,
  DEFAULT_SELECTED_COLUMNS,
} from "./availableColumns";
import { calculateAgeInMonths, getAgeRange } from "@/utils/formatDates";

async function generateAnimalByFarmReport(
  params: ReportGeneratorParams
): Promise<void> {
  const { filters } = params;

  // Get database instance
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  // Build selector based on filters
  const selector: any = {
    _deleted: { $eq: false },
    farm_id: { $eq: filters.farmId },
  };

  // Add sex filter if not "Ambos"
  if (filters.sex && filters.sex !== "Ambos") {
    selector.sex = { $eq: filters.sex };
  }

  // Fetch animals from database
  const docs = await db.animals
    .find({
      selector,
      sort: [{ rgn: "desc" as const }],
    })
    .exec();

  const animals = docs.map((doc) => doc.toJSON() as Animal);

  // Transform data for report
  const reportData = {
    farmName: filters.farmName || "Geral",
    gender: filters.sex || "Ambos",
    totalItems: animals.length,
    data: animals.map((animal) => ({
      rgd: animal.serie_rgd || "",
      rgn: animal.rgn || "",
      name: animal.name || "---",
      birthDate: animal.born_date
        ? new Date(animal.born_date).toLocaleDateString("pt-BR")
        : "---",
      age: animal.born_date ? calculateAge(new Date(animal.born_date)) : "---",
      fatherRgd: animal.father_name || "---",
      motherRgd: animal.mother_rgn
        ? `${animal.mother_serie_rgd || ""} ${animal.mother_rgn}`
            .replace(/\//g, "")
            .trim()
        : "---",
      iabcgz: animal.iabcgz || "---",
      deca: animal.deca || "---",
      maternal_grandfather_name: animal.maternal_grandfather_name || "---",
      paternal_grandfather_name: animal.paternal_grandfather_name || "---",
      p: animal.p || "---",
      f: animal.f || "---",
      classification: animal.classification || "---",
      status: animal.status || "---",
      society: animal.partnership || "---",
      sex: animal.sex || "---",
      category: getAgeRange(calculateAgeInMonths(animal.born_date)),
      observations: "---",
    })),
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: filters.farmName || "Fazenda",
  };

  let selectedColumns =
    filters.selectedColumns && filters.selectedColumns.length > 0
      ? [...filters.selectedColumns]
      : [...DEFAULT_SELECTED_COLUMNS];

  if (
    filters.sex === "Ambos" &&
    !selectedColumns.some((c) => c.dataKey === "sex")
  ) {
    selectedColumns.unshift({ header: "SEXO", dataKey: "sex" });
  }

  await generateAnimalsByFarmPDF(reportData, selectedColumns);
}

function calculateAge(birthDate: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - birthDate.getTime();
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

export const animalByFarmDefinition: ReportDefinition = {
  id: "animals-by-farm",
  title: "Animais por Fazenda",
  description:
    "Lista todos os animais de uma fazenda específica com colunas personalizáveis",
  icon: "Beef",
  requiredFilters: ["farm", "sex"],
  allowColumnSelection: true,
  generate: generateAnimalByFarmReport,
};

export { ANIMAL_REPORT_AVAILABLE_COLUMNS, DEFAULT_SELECTED_COLUMNS };
