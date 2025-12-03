import { Links } from "@/types";

import matrizes from "@/assets/icons/matrizes.png";
import consult from "@/assets/icons/consult.png";
import borns from "@/assets/icons/borns.png";
import vaccines from "@/assets/icons/vaccine.png";
import farm from "@/assets/icons/farm.png";
import weights from "@/assets/icons/weights.png";
import importIcon from "@/assets/icons/import.png";
import reports from "@/assets/icons/reports.png";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Informação animal",
    href: "/consulta",
    iconSrc: consult,
    className: "h-8 w-8 object-cover",
  },
  {
    id: 2,
    name: "Matrizes reprodutivas",
    href: "/matrizes",
    iconSrc: matrizes,
    className: "h-10 w-10 object-cover",
  },
  {
    id: 3,
    name: "Nascimentos",
    href: "/nascimentos",
    iconSrc: borns,
    className: "h-14 w-14 object-cover",
  },
  {
    id: 4,
    name: "Vacinas",
    href: "/vacinas",
    iconSrc: vaccines,
    className: "h-8 w-8 object-cover",
  },
  {
    id: 5,
    name: "Rebanhos Fazendas",
    href: "/gerenciar",
    iconSrc: farm,
    className: "h-8 w-10 object-cover",
  },
  {
    id: 6,
    name: "Pesagem/CE",
    href: "/pesagem-ce",
    iconSrc: weights,
    className: "h-10 w-10 object-cover",
  },
  {
    id: 7,
    name: "Importar dados",
    href: "/importar",
    iconSrc: importIcon,
    className: "h-8 w-10 object-cover",
  },
  {
    id: 8,
    name: "Dados Relatórios",
    href: "/geral",
    iconSrc: reports,
    className: "h-10 w-7 object-cover",
  },
];
