import { useState } from "react";
import { Movement, SalePayload } from "@/types/movement.type";
import { Skull, Banknote, ArrowRightLeft, Edit2, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/formatDates";
import { useClientById } from "@/hooks/db/clients/useClientById";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

interface MovementListItemProps {
  movement: Movement;
  onEdit?: (movement: Movement) => void;
  onDelete?: (id: string) => void;
}

const typeConfig = {
  morte: {
    icon: Skull,
    label: "Morte",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  venda: {
    icon: Banknote,
    label: "Venda",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  troca: {
    icon: ArrowRightLeft,
    label: "Troca",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

const ClientName = ({ clientId }: { clientId: string }) => {
  const { client, isLoading } = useClientById(clientId);

  if (isLoading) return <span className="animate-pulse">...</span>;
  return <span>{client?.name || clientId}</span>;
};

const InfoRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-center border-b border-border/50 py-2 last:border-0">
    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">
      {label}
    </span>
    <span
      className={cn(
        "text-[13px] font-semibold uppercase",
        highlight ? "text-primary" : "text-foreground",
      )}
    >
      {value || "-"}
    </span>
  </div>
);

export function MovementListItem({
  movement,
  onEdit,
  onDelete,
}: MovementListItemProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const config = (typeConfig as any)[movement.type] || typeConfig.morte;
  const Icon = config.icon;

  const renderContent = () => {
    switch (movement.type) {
      case "morte":
        return (
          <div className="space-y-1">
            <InfoRow label="Motivo" value={(movement.details as any).reason} />
          </div>
        );
      case "venda":
        const sale = movement.details as SalePayload;
        return (
          <div className="space-y-1">
            <InfoRow
              label={sale.sale_type === "abate" ? "Frigorífico" : "Cliente"}
              value={(<ClientName clientId={sale.client_id} />) as any}
            />
            <InfoRow
              label="Valor Total"
              value={
                sale.total_value?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }) || "-"
              }
              highlight
            />
            <InfoRow label="Pagamento" value={sale.payment_method || "-"} />
            {sale.payment_method === "Boleto" && (
              <>
                <InfoRow
                  label="Entrada"
                  value={
                    sale.down_payment?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) || "R$ 0,00"
                  }
                />
                <InfoRow label="Parcelas" value={sale.installments || "0"} />
                <InfoRow
                  label="Valor das Parcelas"
                  value={
                    sale.installment_value?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) || "R$ 0,00"
                  }
                  highlight
                />
              </>
            )}
            <InfoRow label="GTA" value={sale.gta_number || "-"} />
            <InfoRow label="Nota Fiscal" value={sale.invoice_number || "-"} />
          </div>
        );
      case "troca":
        const exchange = movement.details as any;
        return (
          <div className="space-y-1">
            <InfoRow
              label="Cliente"
              value={(<ClientName clientId={exchange.client_id} />) as any}
            />
            <InfoRow
              label="Animal Substituto"
              value={exchange.substitute_animal_rgn || "-"}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AccordionItem
      value={movement.id}
      className="border-2 border-primary/20 bg-card/50 rounded-xl overflow-hidden mb-3 shadow-sm"
    >
      <AccordionTrigger className="flex flex-1 items-center justify-between px-4 py-3 hover:no-underline transition-all hover:bg-primary/5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-2 rounded-lg flex items-center justify-center shrink-0",
              config.bg,
              config.color,
            )}
          >
            {(() => {
              const IconComponent = Icon as any;
              return <IconComponent className="w-5 h-5" />;
            })()}
          </div>

          <div className="flex flex-col items-start truncate">
            <span className="font-bold text-base text-foreground tracking-tight">
              {movement.animal_id}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase">
              {formatDate(movement.date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-2 ml-auto">
          <span
            className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm",
              config.bg,
              config.color,
              config.border,
            )}
          >
            {config.label}
          </span>
        </div>

        <div className="flex items-center px-2 mr-1 gap-2">
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(movement);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onEdit?.(movement);
              }
            }}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-md border border-border bg-background shadow-xs hover:border-primary/30 cursor-pointer"
            title="Editar Movimentação"
          >
            <Edit2 size={16} />
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }
            }}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-md border border-border bg-background shadow-xs hover:border-destructive/30 cursor-pointer"
            title="Excluir Movimentação"
          >
            <Trash2 size={16} />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="pt-2 border-t border-border/50">{renderContent()}</div>
      </AccordionContent>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Excluir Movimentação"
        description={`Tem certeza que deseja excluir esta movimentação de ${config.label} do animal ${movement.animal_id}?`}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete?.(movement.id);
          setIsDeleteModalOpen(false);
        }}
      />
    </AccordionItem>
  );
}
