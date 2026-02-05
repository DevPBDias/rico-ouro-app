import { useState, useMemo } from "react";
import { useMovements } from "@/hooks/db/movements/useMovements";
import { MovementListItem } from "./MovementListItem";
import { Input } from "@/components/ui/input";
import { Search, X as XIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MovementList() {
  const { movements, loading } = useMovements();
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

        // Filter by Search (RGN or Description)
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          movement.animal_id.toLowerCase().includes(searchLower) ||
          movement.description.toLowerCase().includes(searchLower);

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
            <Input
              type="date"
              className="bg-muted border-0 rounded-md h-10 w-full text-sm"
              onChange={(e) =>
                setDateFilter(
                  e.target.value ? new Date(e.target.value) : undefined,
                )
              }
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
        <TabsList className="flex w-max min-w-full bg-muted/30 rounded-xl p-1 mb-1 h-auto gap-0.5 border border-border  ">
          {[
            { value: "all", label: "Todas" },
            { value: "nascimento", label: "Nasc." },
            { value: "morte", label: "Morte" },
            { value: "venda", label: "Venda" },
            { value: "troca", label: "Troca" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 min-w-[40px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* List */}
      <div className="space-y-1">
        {filteredMovements.length > 0 ? (
          filteredMovements.map((movement) => (
            <MovementListItem key={movement.id} movement={movement} />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhuma movimentação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
