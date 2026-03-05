import { useState, useMemo } from "react";
import { useMovements } from "@/hooks/db/movements/useMovements";
import { MovementListItem } from "./MovementListItem";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { StandardTabList } from "@/components/ui/StandardTabList";
import { Search, X as XIcon } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Movement } from "@/types/movement.type";
import { DatePicker } from "@/components/ui/date-picker";

interface MovementListProps {
  onEdit?: (movement: Movement) => void;
}

export function MovementList({ onEdit }: MovementListProps) {
  const { movements, loading, deleteMovement } = useMovements();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filteredMovements = useMemo(() => {
    return movements
      .filter((movement) => {
        // Filter by Tab (Type)
        if (activeTab !== "all" && movement.type !== activeTab) {
          return false;
        }

        // Filter by Search (RGN)
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = movement.animal_id
          .toLowerCase()
          .includes(searchLower);

        if (!matchesSearch) return false;

        // Filter by Date
        if (dateFilter) {
          const movementDate = new Date(movement.date)
            .toISOString()
            .split("T")[0];
          const filterDate = dateFilter.toISOString().split("T")[0];
          if (movementDate !== filterDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, activeTab, searchTerm, dateFilter]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full h-24 bg-muted/40 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por RGN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted border-0 rounded-md h-10 placeholder:text-sm"
          />
        </div>

        <div className="flex gap-1">
          <div className="relative w-4/5">
            <DatePicker
              value={dateFilter ? dateFilter.toISOString().split("T")[0] : ""}
              onChange={(value) =>
                setDateFilter(value ? new Date(value) : undefined)
              }
              placeholder="Data"
              className="h-10"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter(undefined)}
              className="h-10 px-3 bg-destructive/50 rounded-md text-destructive-foreground flex items-center justify-center hover:bg-destructive"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <StandardTabList
          variant="simple"
          tabs={[
            { value: "all", label: "Todas" },
            { value: "morte", label: "Morte" },
            { value: "venda", label: "Venda" },
            { value: "troca", label: "Troca" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-1"
        />
      </Tabs>

      {/* List */}
      <Accordion type="single" collapsible className="space-y-1 w-full">
        {filteredMovements.length > 0 ? (
          filteredMovements.map((movement) => (
            <MovementListItem
              key={movement.id}
              movement={movement}
              onEdit={onEdit}
              onDelete={deleteMovement}
            />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhuma movimentação encontrada.
          </div>
        )}
      </Accordion>
    </div>
  );
}
