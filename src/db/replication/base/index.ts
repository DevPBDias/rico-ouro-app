// Re-exports para facilitar imports
export { createReplication } from "./createReplication";
export {
  lastWriteWins,
  serverWins,
  clientWins,
  mergeFields,
  createResolver,
} from "./conflictResolver";
export type {
  ReplicableEntity,
  ReplicationConfig,
  ReplicationCheckpoint,
  ConflictResolver,
} from "./types";
