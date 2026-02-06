"use client";

import { useState, useEffect } from "react";
import { useMovements } from "@/hooks/db/movements/useMovements";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useClients } from "@/hooks/db/clients/useClients";
import { MovementType } from "@/types/movement.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

interface MovementFormProps {
  onSuccess?: () => void;
}

export function MovementForm({ onSuccess }: MovementFormProps) {
  const { createMovement } = useMovements();
  const { animals } = useAnimals();
  const { clients } = useClients();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [movementType, setMovementType] = useState<MovementType | "">("");

  // Common fields (for morte, venda, troca)
  const [animalId, setAnimalId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Animal Validation
  const animalExists = animals.some(
    (a) => a.rgn?.toLowerCase() === animalId.toLowerCase(),
  );
  const showRgnError = animalId.length > 0 && !animalExists;

  // Morte fields
  const [reason, setReason] = useState("");

  // Venda fields
  const [saleType, setSaleType] = useState<"abate" | "comprado">("comprado");
  const [clientId, setClientId] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [installments, setInstallments] = useState("");
  const [gtaNumber, setGtaNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Auto-select Frigorífico when saleType is "abate"
  useEffect(() => {
    if (saleType === "abate") {
      const frigorifico = clients.find((c) =>
        c.name.toLowerCase().includes("frigorífico"),
      );
      if (frigorifico) {
        setClientId(frigorifico.id);
      } else {
        // If not found, we might want to alert or just set a placeholder
        // For now, let's just keep it as is or set to an empty string if not found
        // but the user wants it specifically for frigorífico
      }
    } else if (
      clientId &&
      clients
        .find((c) => c.id === clientId)
        ?.name.toLowerCase()
        .includes("frigorífico")
    ) {
      setClientId(""); // Clear if switching back and it was frigorífico
    }
  }, [saleType, clients]);

  // Troca fields
  const [substituteAnimalRgn, setSubstituteAnimalRgn] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementType || !animalId || !animalExists) return;

    setIsSubmitting(true);

    try {
      let details: any = {};
      let description = "";

      switch (movementType) {
        case "morte":
          details = { reason };
          description = `Morte: ${reason}`;
          break;
        case "venda":
          details = {
            sale_type: saleType,
            client_id: clientId,
            total_value: parseFloat(totalValue) || 0,
            down_payment: parseFloat(downPayment) || 0,
            payment_method: paymentMethod,
            installments: parseInt(installments) || 0,
            gta_number: gtaNumber,
            invoice_number: invoiceNumber,
          };
          const clientName =
            clients.find((c) => c.id === clientId)?.name || "Cliente";
          description = `Venda (${saleType === "abate" ? "Abate" : "Comprado"}): ${clientName}`;
          break;
        case "troca":
          details = {
            client_id: clientId,
            traded_animal_rgn: animalId,
            substitute_animal_rgn: substituteAnimalRgn,
          };
          description = `Troca por ${substituteAnimalRgn || "N/A"}`;
          break;
        default:
          break;
      }

      await createMovement({
        type: movementType,
        animal_id: animalId,
        date,
        description,
        details,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle2
            className="w-10 h-10 text-green-500"
            strokeWidth={2.5}
          />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-foreground text-2xl font-bold">
            Movimentação Registrada!
          </h3>
          <p className="text-muted-foreground text-sm">
            O status do animal foi atualizado.
          </p>
        </div>
        <Button
          onClick={() => onSuccess?.()}
          className="h-14 w-full max-w-xs rounded-2xl font-bold shadow-lg shadow-primary/20"
        >
          Voltar para Movimentações
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary uppercase">
          Nova Movimentação
        </h2>
        <p className="text-muted-foreground text-sm">
          Registre morte, venda ou troca de animal.
        </p>
      </div>

      <div className="space-y-2 w-full">
        <label className="text-xs uppercase font-bold text-primary">
          Tipo de Movimentação
        </label>
        <Select
          value={movementType}
          onValueChange={(v) => setMovementType(v as MovementType)}
        >
          <SelectTrigger className="bg-muted border-0 rounded-sm mt-1 w-40">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morte">Morte</SelectItem>
            <SelectItem value="venda">Venda</SelectItem>
            <SelectItem value="troca">Troca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {movementType && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-primary px-1">
                Animal (RGN)
              </label>
              <div className="relative">
                <Input
                  id="animal-rgn-input"
                  name="animalId"
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value.toUpperCase())}
                  autoComplete="off"
                  spellCheck={false}
                  className={`bg-muted border-0 rounded-sm mt-1 placeholder:text-xs ${
                    showRgnError ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="Digite o RGN do animal..."
                />
                {showRgnError && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 px-1">
                    Animal não cadastrado no banco.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-primary px-1">
                Data
              </label>
              <Input
                id="movement-date"
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                autoComplete="off"
                className="mt-1 bg-muted border-0 rounded-sm w-fit text-sm"
                required
              />
            </div>
          </div>

          {movementType === "morte" && (
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-primary px-1">
                Motivo
              </label>
              <Input
                id="death-reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                placeholder="Ex: Picada de cobra"
                required
              />
            </div>
          )}

          {movementType === "venda" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Tipo de Venda
                  </label>
                  <Select
                    value={saleType}
                    onValueChange={(v) =>
                      setSaleType(v as "abate" | "comprado")
                    }
                  >
                    <SelectTrigger className="bg-muted border-0 rounded-sm mt-1 w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprado">Compra Cliente</SelectItem>
                      <SelectItem value="abate">Abate Frigorífico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Cliente
                  </label>
                  <Select
                    value={clientId}
                    onValueChange={setClientId}
                    disabled={saleType === "abate"}
                  >
                    <SelectTrigger className="bg-muted border-0 rounded-sm mt-1 w-full text-left">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {saleType === "abate" && !clientId && (
                    <p className="text-[10px] text-orange-500 font-semibold mt-1 px-1 leading-tight">
                      Atenção: Cliente "Frigorífico" não encontrado no cadastro.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Valor Total (R$)
                  </label>
                  <Input
                    id="sale-total-value"
                    name="totalValue"
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    autoComplete="off"
                    className="bg-muted border-0 rounded-sm mt-1"
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2 w-full">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Tipo Pagamento
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="bg-muted border-0 rounded-sm mt-1 w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="À Vista">À Vista</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {paymentMethod === "Boleto" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-primary px-1">
                      Entrada (R$)
                    </label>
                    <Input
                      id="sale-down-payment"
                      name="downPayment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      autoComplete="off"
                      className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-primary px-1">
                      Parcelas
                    </label>
                    <Input
                      id="sale-installments"
                      name="installments"
                      type="number"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      autoComplete="off"
                      className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    GTA
                  </label>
                  <Input
                    id="sale-gta-number"
                    name="gtaNumber"
                    value={gtaNumber}
                    onChange={(e) => setGtaNumber(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                    placeholder="Nº GTA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Nota Fiscal
                  </label>
                  <Input
                    id="sale-invoice-number"
                    name="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                    placeholder="Nº NF"
                  />
                </div>
              </div>
            </>
          )}

          {movementType === "troca" && (
            <>
              <div className="space-y-2 w-full">
                <label className="text-xs uppercase font-bold text-primary px-1">
                  Cliente
                </label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="bg-muted border-0 rounded-sm mt-1 w-full">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-primary px-1">
                  Animal Substituto (RGN)
                </label>
                <Input
                  id="substitute-animal-rgn"
                  name="substituteAnimalRgn"
                  value={substituteAnimalRgn}
                  onChange={(e) =>
                    setSubstituteAnimalRgn(e.target.value.toUpperCase())
                  }
                  autoComplete="off"
                  spellCheck={false}
                  className="bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                  placeholder="RGN do animal"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !animalId || !animalExists}
            className="h-12 w-full text-base uppercase font-bold rounded-md mt-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                Finalizar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
