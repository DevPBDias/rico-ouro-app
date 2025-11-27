/**
 * Core hooks para Local-First Architecture
 * 
 * Estes hooks fornecem a base para toda a interação com RxDB:
 * - useLocalQuery: Queries reativas
 * - useLocalDocument: Documento único reativo
 * - useLocalMutation: Mutations (create, update, delete)
 * 
 * Todos os hooks específicos de collections devem usar estes hooks core.
 */

export { useLocalQuery } from "./useLocalQuery";
export { useLocalDocument } from "./useLocalDocument";
export { useLocalMutation } from "./useLocalMutation";
