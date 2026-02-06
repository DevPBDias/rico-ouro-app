"use client";

import { useMemo, useCallback } from "react";
import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Movement, SalePayload } from "@/types/movement.type";
import { getDatabase } from "@/db/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type { MangoQuery } from "rxdb";

export function useMovements() {
  const query = useMemo<MangoQuery<Movement>>(
    () => ({
      selector: { _deleted: { $eq: false } },
      sort: [{ date: "desc" } as any],
    }),
    [],
  );

  const {
    data: movements,
    isLoading,
    error,
    refetch,
  } = useLocalQuery<Movement>("movements", query);

  const {
    create,
    update,
    isLoading: isMutationLoading,
  } = useLocalMutation<Movement>("movements");

  const createMovement = useCallback(
    async (
      data: Omit<Movement, "id" | "created_at" | "updated_at" | "_deleted">,
    ) => {
      try {
        const db = await getDatabase();
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        // 1. Create the Movement record
        await create({
          ...data,
          id,
          created_at: timestamp,
          updated_at: timestamp,
          _deleted: false,
        } as Movement);

        // 2. Handle Side Effects based on Type
        if (["morte", "venda", "troca"].includes(data.type)) {
          // 3. Update Animal Status to INATIVO
          const animalDoc = await db.animals.findOne(data.animal_id).exec();
          if (animalDoc) {
            await animalDoc.patch({
              animal_state: "INATIVO",
              updated_at: timestamp,
            });
          }

          // 4. If it's a Venda, also create a record in the 'sales' collection
          if (data.type === "venda") {
            const vendaDetails = data.details as SalePayload;
            const saleId = uuidv4();

            await db.sales.insert({
              id: saleId,
              animal_rgn: data.animal_id,
              client_id: vendaDetails.client_id,
              date: data.date,
              total_value: vendaDetails.total_value || 0,
              down_payment: vendaDetails.down_payment || 0,
              payment_method: vendaDetails.payment_method || "",
              installments: vendaDetails.installments || 0,
              financial_status: "pendente", // Default status
              gta_number: vendaDetails.gta_number || "",
              invoice_number: vendaDetails.invoice_number || "",
              sale_type: vendaDetails.sale_type || "comprado",
              updated_at: timestamp,
              _deleted: false,
            });

            // Update movement details with the generated sale_id
            const movementDoc = await db.movements.findOne(id).exec();
            if (movementDoc) {
              await movementDoc.patch({
                details: {
                  ...vendaDetails,
                  sale_id: saleId,
                },
              });
            }
          }
        }

        toast.success("Movimentação registrada com sucesso!");
      } catch (err) {
        console.error("Erro ao criar movimentação:", err);
        toast.error("Erro ao registrar movimentação.");
        throw err;
      }
    },
    [create],
  );

  const getMovementsByAnimal = useCallback(
    async (rgn: string): Promise<Movement[]> => {
      const db = await getDatabase();
      if (!db?.movements) return [];
      const docs = await db.movements
        .find({
          selector: {
            animal_id: rgn,
            _deleted: { $eq: false },
          },
        })
        .exec();
      return docs.map((d: any) => d.toJSON() as Movement);
    },
    [],
  );

  return {
    movements: movements || [],
    loading: isLoading || isMutationLoading,
    error,
    createMovement,
    getMovementsByAnimal,
    refetch,
  };
}
