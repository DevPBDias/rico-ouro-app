/**
 * Report Definition: Sanitary by Farm (Sanitário - Vacinas)
 *
 * This report lists all vaccine applications for animals in a farm
 * within a specified date range. One row per vaccine application.
 *
 * Required Filters: farm, dateRange
 * Allows Column Selection: No (fixed columns)
 */

import { getDatabase } from "@/db/client";
import { Animal } from "@/types/animal.type";
import { AnimalVaccine, Vaccine } from "@/types/vaccine.type";
import { ReportDefinition, ReportGeneratorParams } from "./types";
import { generateSanitaryByFarmPDF } from "../generators/sanitary-by-farm";

/**
 * Fetches sanitary/vaccine data and generates the PDF report.
 *
 * @param params - Filters from the context
 */
async function generateSanitaryReport(
  params: ReportGeneratorParams
): Promise<void> {
  const { filters } = params;

  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");

  // Fetch animals from the selected farm
  const animalSelector: any = {
    _deleted: { $eq: false },
    farm_id: { $eq: filters.farmId },
  };

  // Add animal_state filter only if animalStateFilterMode is "specific"
  if (
    filters.animalState &&
    filters.animalStateFilterMode === "specific" &&
    filters.animalState !== "Ambos"
  ) {
    animalSelector.animal_state = { $eq: filters.animalState };
  }

  const animalDocs = await db.animals
    .find({
      selector: animalSelector,
    })
    .exec();

  const animals = animalDocs.map((doc) => doc.toJSON() as Animal);
  const animalRgns = animals.map((a) => a.rgn);

  // Fetch all vaccines for name lookup
  const vaccineDocs = await db.vaccines
    .find({
      selector: { _deleted: { $eq: false } },
    })
    .exec();
  const vaccines = vaccineDocs.map((doc) => doc.toJSON() as Vaccine);
  const vaccineMap = new Map(vaccines.map((v) => [v.id, v.vaccine_name]));

  // Fetch animal vaccines within date range
  const vaccinationDocs = await db.animal_vaccines
    .find({
      selector: {
        _deleted: { $eq: false },
        rgn: { $in: animalRgns },
        date: {
          $gte: filters.startDate || "",
          $lte: filters.endDate || new Date().toISOString().split("T")[0],
        },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  const vaccinations = vaccinationDocs.map(
    (doc) => doc.toJSON() as AnimalVaccine
  );

  // Create animal lookup map
  const animalMap = new Map(animals.map((a) => [a.rgn, a]));

  // Transform data for report - one row per vaccination
  const reportData = {
    farmName: filters.farmName || "Fazenda",
    startDate: filters.startDate
      ? new Date(filters.startDate).toLocaleDateString("pt-BR")
      : "",
    endDate: filters.endDate
      ? new Date(filters.endDate).toLocaleDateString("pt-BR")
      : "",
    data: vaccinations.map((vac) => {
      const animal = animalMap.get(vac.rgn);
      return {
        rgd: animal?.serie_rgd || "",
        rgn: vac.rgn || "",
        animalName: animal?.name || "---",
        vaccineName: vaccineMap.get(vac.vaccine_id) || "---",
        date: vac.date ? new Date(vac.date).toLocaleDateString("pt-BR") : "---",
        observations: "---",
      };
    }),
    reportDate: new Date().toLocaleDateString("pt-BR"),
    systemName: "Rico Ouro",
  };

  await generateSanitaryByFarmPDF(reportData);
}

/**
 * Report definition for "Sanitary (Vaccines)"
 */
export const sanitaryByFarmDefinition: ReportDefinition = {
  id: "sanitary-by-farm",
  title: "Sanitário Vacinas",
  description: "Lista todas as aplicações de vacinas em um período específico",
  icon: "Syringe",
  requiredFilters: ["farm", "dateRange"],
  allowColumnSelection: false,
  generate: generateSanitaryReport,
};
