import { RxCollection, RxDatabase } from "rxdb";

export type AnimalCollection = RxCollection<Animal>;
export type VaccineCollection = RxCollection<Vaccine>;
export type FarmCollection = RxCollection<Farm>;
export type AnimalMetricWeightCollection = RxCollection<AnimalMetric>;
export type AnimalMetricCECollection = RxCollection<AnimalMetric>;
export type AnimalVaccineCollection = RxCollection<AnimalVaccine>;
export type ReproductionCollection = RxCollection<ReproductionEvent>;

export type MyDatabaseCollections = {
  animals: AnimalCollection;
  vaccines: VaccineCollection;
  farms: FarmCollection;
  animal_metrics_weight: AnimalMetricWeightCollection;
  animal_metrics_ce: AnimalMetricCECollection;
  animal_vaccines: AnimalVaccineCollection;
  reproduction_events: ReproductionCollection;
};

import { RxReplicationState } from "rxdb/plugins/replication";
import { AnimalMetric } from "@/types/animal_metrics.type";
import { Animal } from "@/types/animal.type";
import { AnimalVaccine, Vaccine } from "@/types/vaccine.type";
import { Farm } from "@/types/farm.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";

export type MyDatabase = RxDatabase<MyDatabaseCollections> & {
  replications?: {
    animals: RxReplicationState<Animal, any>;
    vaccines: RxReplicationState<Vaccine, any>;
    farms: RxReplicationState<Farm, any>;
    animal_metrics_weight: RxReplicationState<AnimalMetric, any>;
    animal_metrics_ce: RxReplicationState<AnimalMetric, any>;
    animal_vaccines: RxReplicationState<AnimalVaccine, any>;
    reproduction_events: RxReplicationState<ReproductionEvent, any>;
  };
};
