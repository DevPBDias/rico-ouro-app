import { Links } from "@/types";
import {
  ArrowUpNarrowWideIcon,
  Baby,
  CornerRightDown,
  Database,
  Search,
  Settings,
  Star,
  Syringe,
} from "lucide-react";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Informação animal",
    href: "/consulta",
    icon: Search,
  },
  {
    id: 2,
    name: "Matrizes reprodutivas",
    href: "/matrizes",
    icon: Star,
  },
  {
    id: 3,
    name: "Nascimentos",
    href: "/nascimentos",
    icon: Baby,
  },
  {
    id: 4,
    name: "Vacinas",
    href: "/vacinas",
    icon: Syringe,
  },

  {
    id: 5,
    name: "Gerenciar rebanhos",
    href: "/gerenciar",
    icon: Settings,
  },
  {
    id: 6,
    name: "Pesagem / CE",
    href: "/pesagem",
    icon: ArrowUpNarrowWideIcon,
  },
  {
    id: 7,
    name: "Importar dados",
    href: "/importar",
    icon: CornerRightDown,
  },
  {
    id: 8,
    name: "Dados Relatórios",
    href: "/geral",
    icon: Database,
  },
];
