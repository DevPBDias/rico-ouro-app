import { useState, useEffect } from "react";
import { useMovements } from "@/hooks/db/movements/useMovements";
import { MovementListItem } from "./MovementListItem";
import { Loader2 } from "lucide-react";

interface DetailsMovementListProps {
  rgn: string;
}

export function DetailsMovementList({ rgn }: DetailsMovementListProps) {
  const { getMovementsByAnimal, deleteMovement } = useMovements();
  const [movements, setMovements] = useState<any[]>([]); // TODO: Type correctly after fetch fix
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMovements() {
      try {
        const data = await getMovementsByAnimal(rgn);
        if (mounted) {
          setMovements(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMovements();

    return () => {
      mounted = false;
    };
  }, [rgn, getMovementsByAnimal]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-sm gap-2 bg-muted/20 rounded-xl border border-dashed">
        <p>Nenhuma movimentação registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {movements.map((movement) => (
        <MovementListItem
          key={movement.id}
          movement={movement}
          onDelete={deleteMovement}
        />
      ))}
    </div>
  );
}
