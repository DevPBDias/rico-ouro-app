import { Links } from "@/types";
import { Columns3Cog, File } from "lucide-react";

const globalDataLinks: Links[] = [
  {
    id: 1,
    name: "Relação de animais",
    href: "/geral/bois",
    icon: Columns3Cog,
  },
  {
    id: 2,
    name: "Relatórios",
    href: "/geral/relatorios",
    icon: File,
  },
];

export default globalDataLinks;
