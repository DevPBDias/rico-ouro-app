import { MatrizCollection } from "../collections";
import { replicateCollection } from "./replicateCollection";

export const replicateMatriz = (collection: MatrizCollection) => {
  return replicateCollection({
    collection,
    tableName: "matriz",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
