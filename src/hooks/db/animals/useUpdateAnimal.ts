"use client";

import { useLocalMutation } from "@/hooks/core";
import { Animal } from "@/types/animal.type";
import { useRxDatabase } from "@/providers";

export function useUpdateAnimal() {
  const { update, isLoading, error } = useLocalMutation<Animal>("animals");
  const db = useRxDatabase();

  const updateAnimal = async (
    rgn: string,
    data: Partial<Animal>,
  ): Promise<void> => {
    // Se o RGN estiver sendo alterado (caso de ID temporário sendo atualizado)
    if (data.rgn && data.rgn !== rgn) {
      if (!db) throw new Error("Database not initialized");

      const animalsColl = (db as any).animals;

      // 1. Buscar animal atual
      const oldDoc = await animalsColl.findOne(rgn).exec();
      if (!oldDoc) throw new Error(`Animal ${rgn} não encontrado.`);

      const oldData = oldDoc.toJSON();

      // 2. Inserir novo animal com novo RGN
      // RxDB não permite alterar a primaryKey, então precisamos inserir um novo e deletar o antigo
      const newData = {
        ...oldData,
        ...data,
        updated_at: Date.now(),
        _deleted: false,
      };
      await animalsColl.insert(newData);

      // 3. Migrar registros relacionados
      // Identificamos coleções que usam o RGN como chave estrangeira
      const collectionsToMigrate = [
        "animal_metrics_weight",
        "animal_metrics_ce",
        "animal_vaccines",
        "reproduction_events",
      ];

      for (const colName of collectionsToMigrate) {
        const col = (db as any)[colName];
        if (col) {
          const records = await col.find({ selector: { rgn } }).exec();
          if (records.length > 0) {
            await Promise.all(
              records.map((rec: any) =>
                rec.patch({
                  rgn: data.rgn,
                  updated_at: Date.now(),
                }),
              ),
            );
          }
        }
      }

      // 4. Soft delete do animal antigo para manter sincronia com Supabase
      await oldDoc.patch({
        _deleted: true,
        updated_at: Date.now(),
      });

      return;
    }

    const updateData: Partial<Animal> = {
      ...data,
    };

    await update(rgn, updateData);
  };

  return {
    updateAnimal,
    isLoading,
    error,
  };
}
