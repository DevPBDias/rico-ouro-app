"use client";

import { useMemo, useCallback } from "react";
import { useLocalQuery, useLocalMutation } from "@/hooks/core";
import { Movement, SalePayload } from "@/types/movement.type";
import { Sale } from "@/types/sale.type";
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
    create: createMovementLocal,
    update: updateMovementLocal,
    isLoading: isMutationLoading,
  } = useLocalMutation<Movement>("movements");

  const { create: createSaleLocal, update: updateSaleLocal } =
    useLocalMutation<Sale>("sales");

  const createMovement = useCallback(
    async (
      data: Omit<Movement, "id" | "created_at" | "updated_at" | "_deleted">,
    ) => {
      try {
        const db = await getDatabase();
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        console.log("📝 Creating movement:", { id, type: data.type });

        // 1. Create the Movement record
        await createMovementLocal({
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
            console.log(`🐾 Updating animal ${data.animal_id} to INATIVO`);
            await animalDoc.patch({
              animal_state: "INATIVO",
              updated_at: timestamp,
            });
          }

          // 4. If it's a Venda, also create a record in the 'sales' collection
          if (data.type === "venda") {
            const vendaDetails = data.details as SalePayload;
            const saleId = uuidv4();

            console.log("💰 Creating sale record (LocalMutation):", {
              saleId,
              animal_rgn: data.animal_id,
              client_id: vendaDetails.client_id,
            });

            try {
              await createSaleLocal({
                id: saleId,
                animal_rgn: data.animal_id,
                client_id: vendaDetails.client_id,
                date: data.date,
                total_value: vendaDetails.total_value || 0,
                down_payment: vendaDetails.down_payment || 0,
                payment_method: vendaDetails.payment_method || "",
                installments: vendaDetails.installments || 0,
                installment_value: vendaDetails.installment_value || 0,
                value_parcels: vendaDetails.value_parcels || 0,
                financial_status:
                  vendaDetails.payment_method === "À Vista"
                    ? "pago"
                    : "pendente",
                gta_number: vendaDetails.gta_number || "",
                invoice_number: vendaDetails.invoice_number || "",
                sale_type: vendaDetails.sale_type || "comprado",
                updated_at: timestamp,
                _deleted: false,
              });
              console.log("✅ Sale record created successfully");
            } catch (saleErr) {
              console.error("❌ Error inserting sale record:", saleErr);
              toast.error(
                "Movimentação salva, mas erro ao criar registro de venda.",
              );
            }

            // Update movement details with the generated sale_id
            const movementDoc = await db.movements.findOne(id).exec();
            if (movementDoc) {
              console.log(`🔗 Linking sale ${saleId} to movement ${id}`);
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
    [createMovementLocal, createSaleLocal],
  );

  const updateMovement = useCallback(
    async (id: string, data: Partial<Movement>) => {
      try {
        const db = await getDatabase();
        const timestamp = new Date().toISOString();

        console.log("📝 Updating movement:", { id, data });

        await updateMovementLocal(id, {
          ...data,
          id,
          updated_at: timestamp,
        } as Movement);

        // Update corresponding sale if it's a venda
        if (data.type === "venda" || (!data.type && id)) {
          const movementDoc = await db.movements.findOne(id).exec();
          const movement = movementDoc?.toJSON() as Movement;

          if (movement?.type === "venda") {
            const vendaDetails = movement.details as SalePayload;

            if (vendaDetails.sale_id) {
              console.log(`💰 Patching existing sale: ${vendaDetails.sale_id}`);
              const saleDoc = await db.sales
                .findOne(vendaDetails.sale_id)
                .exec();
              if (saleDoc) {
                await saleDoc.patch({
                  total_value: vendaDetails.total_value || 0,
                  down_payment: vendaDetails.down_payment || 0,
                  payment_method: vendaDetails.payment_method || "",
                  installments: vendaDetails.installments || 0,
                  installment_value: vendaDetails.installment_value || 0,
                  value_parcels: vendaDetails.value_parcels || 0,
                  financial_status:
                    vendaDetails.payment_method === "À Vista"
                      ? "pago"
                      : "pendente",
                  gta_number: vendaDetails.gta_number || "",
                  invoice_number: vendaDetails.invoice_number || "",
                  sale_type: vendaDetails.sale_type || "comprado",
                  updated_at: timestamp,
                });
                console.log("✅ Sale patched successfully");
              } else {
                console.warn(
                  `⚠️ Sale doc ${vendaDetails.sale_id} not found, but referenced in movement.`,
                );
              }
            } else {
              // Missing sale_id in movement details, try to create it
              console.log(
                "💰 Sale ID missing in movement, creating new sale record...",
              );
              const saleId = uuidv4();
              try {
                await createSaleLocal({
                  id: saleId,
                  animal_rgn: movement.animal_id,
                  client_id: vendaDetails.client_id,
                  date: movement.date,
                  total_value: vendaDetails.total_value || 0,
                  down_payment: vendaDetails.down_payment || 0,
                  payment_method: vendaDetails.payment_method || "",
                  installments: vendaDetails.installments || 0,
                  installment_value: vendaDetails.installment_value || 0,
                  value_parcels: vendaDetails.value_parcels || 0,
                  financial_status:
                    vendaDetails.payment_method === "À Vista"
                      ? "pago"
                      : "pendente",
                  gta_number: vendaDetails.gta_number || "",
                  invoice_number: vendaDetails.invoice_number || "",
                  sale_type: vendaDetails.sale_type || "comprado",
                  updated_at: timestamp,
                  _deleted: false,
                });

                if (movementDoc) {
                  await movementDoc.patch({
                    details: {
                      ...vendaDetails,
                      sale_id: saleId,
                    },
                  });
                }
                console.log("✅ New sale record created and linked");
              } catch (saleErr) {
                console.error(
                  "❌ Error creating missing sale record:",
                  saleErr,
                );
              }
            }
          }
        }

        toast.success("Movimentação atualizada com sucesso!");
      } catch (err) {
        console.error("Erro ao atualizar movimentação:", err);
        toast.error("Erro ao atualizar movimentação.");
        throw err;
      }
    },
    [updateMovementLocal, createSaleLocal],
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

  const deleteMovement = useCallback(
    async (id: string) => {
      try {
        const db = await getDatabase();
        if (!db) throw new Error("Database not initialized");

        const movementDoc = await db.movements.findOne(id).exec();
        if (!movementDoc) {
          toast.error("Movimentação não encontrada.");
          return;
        }

        const movement = movementDoc.toJSON() as Movement;
        const timestamp = new Date().toISOString();

        console.log("🗑️ Deleting movement:", { id, type: movement.type });

        // 1. If it's a "venda", delete the associated sale record
        if (movement.type === "venda") {
          const vendaDetails = movement.details as SalePayload;
          if (vendaDetails.sale_id) {
            console.log(`💰 Deleting associated sale: ${vendaDetails.sale_id}`);
            const saleDoc = await db.sales.findOne(vendaDetails.sale_id).exec();
            if (saleDoc) {
              await saleDoc.patch({
                _deleted: true,
                updated_at: timestamp,
              });
            }
          }
        }

        // 2. If it's "morte", "venda" or "troca", restore animal state to "ATIVO"
        if (["morte", "venda", "troca"].includes(movement.type)) {
          const animalDoc = await db.animals.findOne(movement.animal_id).exec();
          if (animalDoc) {
            console.log(`🐾 Restoring animal ${movement.animal_id} to ATIVO`);
            await animalDoc.patch({
              animal_state: "ATIVO",
              updated_at: timestamp,
            });
          }
        }

        // 3. Soft delete the movement
        await movementDoc.patch({
          _deleted: true,
          updated_at: timestamp,
        });

        toast.success("Movimentação excluída com sucesso!");
        if (refetch) refetch();
      } catch (err) {
        console.error("Erro ao excluir movimentação:", err);
        toast.error("Erro ao excluir movimentação.");
        throw err;
      }
    },
    [refetch],
  );

  return {
    movements: movements || [],
    loading: isLoading || isMutationLoading,
    error,
    createMovement,
    updateMovement,
    deleteMovement,
    getMovementsByAnimal,
    refetch,
  };
}
