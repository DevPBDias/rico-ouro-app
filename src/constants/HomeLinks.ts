import { Links } from "@/types/links.type";
import matrizes2 from "@/assets/icons/matrizes2.png";
import consult2 from "@/assets/icons/consult2.png";
import borns2 from "@/assets/icons/borns2.png";
import vaccine2 from "@/assets/icons/vaccine2.png";
import farm2 from "@/assets/icons/farm2.png";
import weigths2 from "@/assets/icons/weigths2.png";
import importIcon2 from "@/assets/icons/import2.png";
import reports2 from "@/assets/icons/reports2.png";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Informação animal",
    href: "/consulta",
    iconSrc: consult2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 2,
    name: "Matrizes reprodutivas",
    href: "/matrizes",
    iconSrc: matrizes2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 3,
    name: "Nascimentos",
    href: "/nascimentos",
    iconSrc: borns2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 4,
    name: "Vacinas",
    href: "/vacinas",
    iconSrc: vaccine2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 5,
    name: "Rebanhos Fazendas",
    href: "/gerenciar",
    iconSrc: farm2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 6,
    name: "Pesagem/CE",
    href: "/pesagem-ce",
    iconSrc: weigths2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 7,
    name: "Importar dados",
    href: "/importar",
    iconSrc: importIcon2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 8,
    name: "Dados Relatórios",
    href: "/geral",
    iconSrc: reports2,
    className: "h-12 w-12 object-cover",
  },
];
