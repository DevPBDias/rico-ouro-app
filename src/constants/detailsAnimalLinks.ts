import { Links } from "@/types";
import {
  ArrowUpNarrowWide,
  CircleDashed,
  CircleQuestionMark,
  FileBadge,
} from "lucide-react";

const detailsAnimalLinks: Links[] = [
  {
    id: 1,
    name: "Detalhes do animal",
    href: "/bois/:id/detalhes",
    icon: CircleQuestionMark,
  },
  {
    id: 2,
    name: "Gráficos",
    href: "/bois/:id/graficos",
    icon: ArrowUpNarrowWide,
  },
  {
    id: 3,
    name: "Pesagem",
    href: "/bois/:id/pesagem",
    icon: FileBadge,
  },
  {
    id: 4,
    name: "CE",
    href: "/bois/:id/ce",
    icon: CircleDashed,
  },
];

export default detailsAnimalLinks;
