import { FarmCollection } from "../collections";
import { replicateCollection } from "./replicateCollection";

export const replicateFarms = (collection: FarmCollection) => {
  return replicateCollection({
    collection,
    tableName: "farms",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
