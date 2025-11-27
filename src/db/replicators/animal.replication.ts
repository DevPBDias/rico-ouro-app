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
      // Se já tiver a estrutura aninhada, retorna como está (mas limpo)
      if (doc.animal && typeof doc.animal === "object" && !doc.nome) {
        return cleanNulls(doc);
      }

      // Transforma dados planos (Supabase) para aninhados (RxDB)
      const transformed = {
        uuid: doc.uuid,
        id: doc.id,
        updatedAt: doc.updatedAt,
        _deleted: doc._deleted,
        lastModified: doc.lastModified,
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
          // Mapear arrays se existirem
          pesosMedidos: doc.pesosMedidos || [],
          ganhoDiario: doc.ganhoDiario || [],
          circunferenciaEscrotal: doc.circunferenciaEscrotal || [],
          vacinas: doc.vacinas || [],
        },
        pai: {
          nome: doc.pai_nome || doc.pai?.nome || doc.pai,
        },
        mae: {
          rgn: doc.mae_rgn || doc.mae?.rgn || doc.mae,
          serieRGD: doc.mae_serieRGD,
        },
        avoMaterno: {
          nome: doc.avoMaterno_nome || doc.avoMaterno?.nome || doc.avoMaterno,
        },
      };

      return cleanNulls(transformed);
    },
  });
};
