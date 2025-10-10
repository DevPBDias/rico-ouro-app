import { Links } from "@/types";
import {
  CornerRightDown,
  CornerRightUp,
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
    name: "Relatórios",
    href: "/relatorios",
    icon: File,
  },
  {
    id: 5,
    name: "Nascimentos",
    href: "/nascimentos",
    icon: Star,
  },
  {
    id: 6,
    name: "Vacinas",
    href: "/vacinas",
    icon: Syringe,
  },
  {
    id: 3,
    name: "Exportar dados",
    href: "/exportar",
    icon: CornerRightUp,
  },
  {
    id: 4,
    name: "Importar dados",
    href: "/importar",
    icon: CornerRightDown,
  },
];
