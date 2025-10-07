import { Links } from "@/types";
import { Cloud, FileBadgeIcon } from "lucide-react";

const importLinks: Links[] = [
  {
    id: 1,
    name: "Nuvem",
    href: "/importar/dados-nuvem",
    icon: Cloud,
  },
  {
    id: 2,
    name: "Planilhas",
    href: "/importar/planilhas",
    icon: FileBadgeIcon,
  },
];

export default importLinks;
