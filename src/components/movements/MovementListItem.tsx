import { Movement } from "@/types/movement.type";
import { format } from "date-fns";
import { Skull, Banknote, ArrowRightLeft } from "lucide-react";
import bezerro from "@/assets/icons/bezerro.png";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { formatDate } from "@/utils/formatDates";
import { useClientById } from "@/hooks/db/clients/useClientById";

interface MovementListItemProps {
  movement: Movement;
}

const typeConfig = {
  nascimento: {
    icon: bezerro,
    label: "Nascimento",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
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

export function MovementListItem({ movement }: MovementListItemProps) {
  const config = typeConfig[movement.type] || typeConfig.nascimento;
  const Icon = config.icon;

  const renderDetails = () => {
    switch (movement.type) {
      case "morte":
        return (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p>
              <span className="font-semibold text-muted-foreground">
                Motivo:
              </span>{" "}
              {(movement.details as any).reason}
            </p>
          </div>
        );
      case "venda":
        const sale = movement.details as any;
        return (
          <div className="flex flex-col gap-2 text-sm w-full">
            <div className="flex items-center justify-between">
              <p>
                <span className="font-semibold text-muted-foreground">
                  Cliente:
                </span>{" "}
                <ClientName clientId={sale.client_id} />
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">
                  Valor:
                </span>{" "}
                {sale.total_value?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              {sale.invoice_number && (
                <p>
                  <span className="font-semibold text-muted-foreground">
                    NF:
                  </span>{" "}
                  {sale.invoice_number}
                </p>
              )}
              {sale.payment_method && (
                <p>
                  <span className="font-semibold text-muted-foreground">
                    Pagamento:
                  </span>{" "}
                  {sale.payment_method}
                </p>
              )}
            </div>
          </div>
        );
      case "troca":
        const exchange = movement.details as any;
        return (
          <div className="flex flex-row justify-between items-center text-sm w-full">
            <p>
              <span className="font-semibold text-muted-foreground">
                Substituto:
              </span>{" "}
              {exchange.substitute_animal_rgn || "Nenhum"}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Cliente:
              </span>{" "}
              <ClientName clientId={exchange.client_id} />
            </p>
          </div>
        );
      case "nascimento":
        const birth = movement.details as any;
        return (
          <div className="flex flex-row justify-between items-center text-sm w-full">
            <p>
              <span className="font-semibold text-muted-foreground">Mãe:</span>{" "}
              {birth.mother_rgn}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">Sexo:</span>{" "}
              {birth.sex}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mb-3 overflow-hidden border border-border shadow-sm p-4">
      <div className="flex flex-col items-start gap-2 w-full">
        {/* Icon Box */}
        <div className="flex items-center justify-between w-full">
          <div
            className={`py-2 px-2 rounded-md flex gap-2 items-center justify-center shrink-0 ${config.bg} ${config.color}`}
          >
            {movement.type === "nascimento" ? (
              <Image
                src={Icon as any}
                alt={config.label}
                width={24}
                height={24}
                className="object-contain"
              />
            ) : (
              (() => {
                const IconComponent = Icon as any;
                return <IconComponent className="w-5 h-5" />;
              })()
            )}

            <p className={`text-xs capitalize font-bold ${config.color}`}>
              {movement.type}
            </p>
          </div>
          <span className="font-bold text-lg text-foreground truncate">
            {movement.animal_id}
          </span>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(movement.date)}
          </p>
        </div>

        {/* Main Info */}
        <div className="flex-1 text-left min-w-0 w-full">
          <div className="flex items-center justify-between border-t border-border/50 mt-2 pt-2 w-full">
            {renderDetails()}
          </div>
        </div>
      </div>
    </Card>
  );
}
