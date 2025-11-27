import { RxCollection, RxDatabase } from "rxdb";
import { AnimalData, Farm, Matriz, Vaccine } from "@/types/schemas.types";

export type AnimalCollection = RxCollection<AnimalData>;
export type VaccineCollection = RxCollection<Vaccine>;
export type FarmCollection = RxCollection<Farm>;
export type MatrizCollection = RxCollection<Matriz>;

export type MyDatabaseCollections = {
  animals: AnimalCollection;
  vaccines: VaccineCollection;
  farms: FarmCollection;
  matriz: MatrizCollection;
};

import { RxReplicationState } from "rxdb/plugins/replication";

export type MyDatabase = RxDatabase<MyDatabaseCollections> & {
  replications?: {
    animals: RxReplicationState<AnimalData, any>;
    vaccines: RxReplicationState<Vaccine, any>;
    farms: RxReplicationState<Farm, any>;
    matriz: RxReplicationState<Matriz, any>;
  };
};
