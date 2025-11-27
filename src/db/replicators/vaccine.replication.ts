import { VaccineCollection } from "../collections";
import { replicateCollection } from "./replicateCollection";

export const replicateVaccines = (collection: VaccineCollection) => {
  return replicateCollection({
    collection,
    tableName: "vaccines",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
