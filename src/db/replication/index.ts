// ==========================================
// SISTEMA DE REPLICAÇÃO PADRONIZADO
// ==========================================
//
// Este módulo fornece uma arquitetura padronizada para
// replicação RxDB ↔ Supabase seguindo princípios local-first.
//
// PRINCÍPIOS:
// 1. RxDB é a fonte primária (local-first)
// 2. Supabase é eventual (sync quando online)
// 3. Escritas são sempre locais primeiro
// 4. Replicação é idempotente
// 5. Conflitos são tratados explicitamente
//
// COMO USAR:
// 1. Importe createReplication e um conflictResolver
// 2. Crie sua replicação com a configuração adequada
// 3. Registre no replication.ts principal
//
// EXEMPLO:
// ```typescript
// import { createReplication, lastWriteWins } from "./base";
//
// export const myEntityReplication = createReplication<MyEntity>({
//   collectionName: "my_entities",
//   tableName: "my_entities",
//   mapToSupabase: (doc) => ({ ...doc }),
//   conflictResolver: lastWriteWins,
// });
// ```
// ==========================================

// Re-export base utilities
export * from "./base";

// Re-export entity replications (novo template)
export { animalReplication, replicateAnimalsNew } from "./animal.replication";
export {
  semenDoseReplication,
  replicateSemenDosesNew,
} from "./semenDose.replication";
export { farmReplication, replicateFarmsNew } from "./farm.replication";
export {
  vaccineReplication,
  replicateVaccinesNew,
} from "./vaccine.replication";
export {
  animalVaccineReplication,
  replicateAnimalVaccinesNew,
} from "./animalVaccine.replication";
export {
  animalMetricWeightReplication,
  replicateAnimalMetricWeightNew,
  animalMetricCEReplication,
  replicateAnimalMetricCENew,
} from "./metric.replication";
export {
  reproductionEventReplication,
  replicateReproductionEventsNew,
} from "./reproduction.replication";
export {
  animalStatusReplication,
  replicateAnimalStatusesNew,
} from "./status.replication";

// TODO: Migrar outras entidades para o novo template:
// - vaccine.replication.ts
// - farm.replication.ts
// - animal_metric_weight.replication.ts
// - animal_metric_ce.replication.ts
// - animal_vaccine.replication.ts
// - reproduction_event.replication.ts
// - animal_status.replication.ts
