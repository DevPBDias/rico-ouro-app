import { Links } from "@/types";
import {
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
    name: "Dados/Relatórios",
    href: "/geral",
    icon: Database,
  },
  {
    id: 3,
    name: "Nascimentos",
    href: "/nascimentos",
    icon: Star,
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
    name: "Importar dados",
    href: "/importar",
    icon: CornerRightDown,
  },
];
