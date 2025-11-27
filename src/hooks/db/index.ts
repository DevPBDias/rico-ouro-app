/**
 * Hooks para Collections do RxDB
 *
 * Todos os hooks seguem o padrão local-first:
 * - Queries são reativas
 * - Mutations sincronizam automaticamente
 * - Sem chamadas diretas ao Supabase
 */

// Animals
export { useAnimals } from "./useAnimals";
export { useAnimal } from "./useAnimal";
export { useCreateAnimal } from "./useCreateAnimal";
export { useUpdateAnimal } from "./useUpdateAnimal";
export { useDeleteAnimal } from "./useDeleteAnimal";

// Farms
export { useFarms } from "./useFarms";
export { useFarm } from "./useFarm";
export { useCreateFarm } from "./useCreateFarm";
export { useUpdateFarm } from "./useUpdateFarm";
export { useDeleteFarm } from "./useDeleteFarm";

// Matrizes
export { useMatrizes } from "./useMatrizes";
export { useMatriz } from "./useMatriz";
export { useCreateMatriz } from "./useCreateMatriz";
export { useUpdateMatriz } from "./useUpdateMatriz";
export { useDeleteMatriz } from "./useDeleteMatriz";

// Vaccines
export { useVaccines } from "./useVaccines";
export { useVaccine } from "./useVaccine";
export { useCreateVaccine } from "./useCreateVaccine";
export { useUpdateVaccine } from "./useUpdateVaccine";
export { useDeleteVaccine } from "./useDeleteVaccine";

// Re-export core hooks for convenience
export { useLocalQuery, useLocalDocument, useLocalMutation } from "../core";
