import { AnimalCollection } from "../collections";
import { replicateCollection } from "./replicateCollection";

export const replicateAnimals = (collection: AnimalCollection) => {
  return replicateCollection({
    collection,
    tableName: "animals",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
