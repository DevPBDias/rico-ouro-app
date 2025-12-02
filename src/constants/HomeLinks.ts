import { Links } from "@/types";
import {
  ArrowUpNarrowWideIcon,
  Baby,
  CornerRightDown,
  Database,
  Search,
  Syringe,
} from "lucide-react";
import bovine_corral from "@/assets/icons/bovine_corral.png";
import baby_cow from "@/assets/icons/baby_cow.png";
import cow_head from "@/assets/icons/cow_head.png";

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
    iconSrc: cow_head,
  },
  {
    id: 3,
    name: "Nascimentos",
    href: "/nascimentos",
    iconSrc: baby_cow,
  },
  {
    id: 4,
    name: "Vacinas",
    href: "/vacinas",
    icon: Syringe,
  },

  {
    id: 5,
    name: "Rebanhos Fazendas",
    href: "/gerenciar",
    iconSrc: bovine_corral,
  },
  {
    id: 6,
    name: "Pesagem / CE",
    href: "/pesagem-ce",
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
