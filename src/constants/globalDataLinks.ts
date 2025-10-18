import { Links } from "@/types";
import { ChartColumnDecreasing, Columns3Cog } from "lucide-react";

const globalDataLinks: Links[] = [
  {
    id: 1,
    name: "Relação de animais",
    href: "/geral/bois",
    icon: Columns3Cog,
  },
  {
    id: 2,
    name: "Gráficos",
    href: "/geral/graficos",
    icon: ChartColumnDecreasing,
  },
];

export default globalDataLinks;
