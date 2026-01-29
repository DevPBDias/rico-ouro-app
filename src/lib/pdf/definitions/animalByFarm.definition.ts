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
  params: ReportGeneratorParams,
): Promise<void> {
  const { filters } = params;

  // Get database instance
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  // Fetch farms for mapping farm_id to farm_name
  const farmDocs = await db.farms
    .find({
      selector: { _deleted: { $eq: false } },
    })
    .exec();
  const farms = farmDocs.map((doc) => doc.toJSON());
  const farmMap = new Map(farms.map((f: any) => [f.id, f.farm_name || ""]));

  // Build selector based on filters
  const selector: any = {
    _deleted: { $eq: false },
  };

  // Add farm filter only if farmId is provided and filterMode is "specific"
  if (filters.farmId && filters.farmFilterMode === "specific") {
    selector.farm_id = { $eq: filters.farmId };
  }

  // Add sex filter only if sexFilterMode is "specific"
  if (
    filters.sex &&
    filters.sexFilterMode === "specific" &&
    filters.sex !== "Ambos"
  ) {
    selector.sex = { $eq: filters.sex };
  }

  // Add status filter only if statusFilterMode is "specific"
  if (
    filters.status &&
    filters.statusFilterMode === "specific" &&
    filters.status !== "Todos"
  ) {
    selector.status = { $eq: filters.status };
  }

  // Add class filter only if classFilterMode is "specific"
  if (
    filters.classes &&
    filters.classes.length > 0 &&
    filters.classFilterMode === "specific"
  ) {
    selector.classification = { $in: filters.classes };
  }

  // Add society filter only if societyFilterMode is "specific"
  if (filters.society && filters.societyFilterMode === "specific") {
    selector.partnership = { $eq: filters.society };
  }

  // Fetch animals from database
  const docs = await db.animals
    .find({
      selector,
      sort: [{ rgn: "asc" as const }],
    })
    .exec();

  const animals = docs.map((doc) => doc.toJSON() as Animal);

  // Determine which filter columns to show
  // Only show when column is selected AND filterMode is "all"
  // When filterMode is "specific", don't show the column (it doesn't count towards limit)
  const isFarmColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "farmName") ?? false;
  const isSexColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "sex") ?? false;
  const isStatusColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "status") ?? false;
  const isClassColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "classification") ??
    false;
  const isSocietyColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "society") ?? false;

  const showFarmColumn = isFarmColumnSelected;
  const showSexColumn = isSexColumnSelected;
  const showStatusColumn = isStatusColumnSelected;
  const showClassColumn = isClassColumnSelected;
  const showSocietyColumn = isSocietyColumnSelected;

  // Transform data for report
  const reportData = {
    farmName: filters.farmName || "Todas as Fazendas",
    gender: filters.sex || "Ambos",
    totalItems: animals.length,
    showFarmColumn,
    showSexColumn,
    showStatusColumn,
    showClassColumn,
    showSocietyColumn,
    sortBy: filters.sortBy || "rgn", // Ordenação: RGN (padrão) ou Classe
    data: animals.map((animal) => ({
      rgd: animal.serie_rgd || "",
      rgn: animal.rgn || "",
      farmName: showFarmColumn
        ? farmMap.get(animal.farm_id || "") || "---"
        : undefined,
      sex: showSexColumn ? animal.sex || "---" : undefined,
      status: showStatusColumn ? animal.status || "---" : undefined,
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
      classification: showClassColumn
        ? animal.classification || "---"
        : undefined,
      society: showSocietyColumn ? animal.partnership || "---" : undefined,
      genotype: animal.genotyping || "---",
      category: getAgeRange(calculateAgeInMonths(animal.born_date)),
      observations: "---",
    })),
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: filters.farmName || "Todas as Fazendas",
  };

  let selectedColumns =
    filters.selectedColumns && filters.selectedColumns.length > 0
      ? [...filters.selectedColumns]
      : [...DEFAULT_SELECTED_COLUMNS];

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
    "Lista todos os animais (de uma fazenda específica ou todas) com colunas personalizáveis",
  icon: "Beef",
  requiredFilters: ["sex", "status"], // farm é opcional agora
  allowColumnSelection: true,
  generate: generateAnimalByFarmReport,
};

export { ANIMAL_REPORT_AVAILABLE_COLUMNS, DEFAULT_SELECTED_COLUMNS };
