import { AnimalCollection } from "../collections";
import { replicateCollection } from "./replicateCollection";
import { cleanNulls } from "@/utils/cleanNulls";

export const replicateAnimals = (collection: AnimalCollection) => {
  return replicateCollection({
    collection,
    tableName: "animals",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    transformPull: (doc: any) => {
      // 1. Prepare base fields
      const base = {
        uuid: doc.uuid,
        id: doc.id,
        _deleted: doc._deleted,
        updatedAt: doc.updatedAt,
      };

      // 2. Check if data is already nested (RxDB format)
      if (doc.animal && typeof doc.animal === "object" && !doc.nome) {
        return cleanNulls({
          ...base,
          animal: doc.animal || {},
          pai: doc.pai || {},
          mae: doc.mae || {},
          avoMaterno: doc.avoMaterno || {},
        });
      }

      // 3. Transform flat data (Supabase legacy format) to nested
      const transformed = {
        ...base,
        animal: {
          nome: doc.nome,
          serieRGD: doc.serieRGD,
          rgn: doc.rgn,
          sexo: doc.sexo,
          nasc: doc.nasc,
          iabcgz: doc.iabcgz,
          deca: doc.deca,
          p: doc.p,
          f: doc.f,
          corNascimento: doc.corNascimento,
          status: doc.status,
          farm: doc.farm,
          pesosMedidos: doc.pesosMedidos,
          ganhoDiario: doc.ganhoDiario,
          circunferenciaEscrotal: doc.circunferenciaEscrotal,
          vacinas: doc.vacinas,
        },
        pai: {
          nome:
            doc.pai_nome ||
            doc.pai?.nome ||
            (typeof doc.pai === "string" ? doc.pai : undefined),
        },
        mae: {
          rgn:
            doc.mae_rgn ||
            doc.mae?.rgn ||
            (typeof doc.mae === "string" ? doc.mae : undefined),
          serieRGD: doc.mae_serieRGD,
        },
        avoMaterno: {
          nome:
            doc.avoMaterno_nome ||
            doc.avoMaterno?.nome ||
            (typeof doc.avoMaterno === "string" ? doc.avoMaterno : undefined),
        },
      };

      return cleanNulls(transformed);
    },
  });
};
