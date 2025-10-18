import { Links } from "@/types";
import { FileBadgeIcon, FileChartColumn } from "lucide-react";

const reportLinks: Links[] = [
  {
    id: 1,
    name: "PDF",
    href: "/relatorios/pdf",
    icon: FileChartColumn,
  },
  {
    id: 2,
    name: "Planilhas",
    href: "/relatorios/planilhas",
    icon: FileBadgeIcon,
  },
];

export default reportLinks;
