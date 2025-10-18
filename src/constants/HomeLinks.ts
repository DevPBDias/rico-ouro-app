import { Links } from "@/types";
import {
  CornerRightDown,
  Database,
  File,
  Search,
  Star,
  Syringe,
} from "lucide-react";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Consultar animal",
    href: "/consulta",
    icon: Search,
  },
  {
    id: 2,
    name: "Dados gerais",
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
    name: "Relatórios",
    href: "/relatorios",
    icon: File,
  },
  {
    id: 6,
    name: "Importar dados",
    href: "/importar",
    icon: CornerRightDown,
  },
];
