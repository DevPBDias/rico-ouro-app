import { Links } from "@/types/links.type";
import consult2 from "@/assets/icons/consult2.png";
import borns2 from "@/assets/icons/borns2.png";
import vaccine2 from "@/assets/icons/vaccine2.png";
import farm2 from "@/assets/icons/farm2.png";
import weigths2 from "@/assets/icons/weigths2.png";
import importIcon2 from "@/assets/icons/import2.png";
import reports2 from "@/assets/icons/reports2.png";
import reproduction from "@/assets/icons/reproduction_bov.png";
import semen from "@/assets/icons/semen.png";
import historico from "@/assets/icons/historico.png";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Consulta Animal",
    href: "/consulta",
    iconSrc: consult2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 2,
    name: "Movimentação / Venda",
    href: "/dashboard",
    iconSrc: historico,
    className: "h-14 w-14 object-cover",
  },
  {
    id: 3,
    name: "Reprodução",
    href: "/reproducao",
    iconSrc: reproduction,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 4,
    name: "Nascimento",
    href: "/nascimentos",
    iconSrc: borns2,
    className: "h-14 w-14 object-cover",
  },
  {
    id: 5,
    name: "Vacinas",
    href: "/vacinas",
    iconSrc: vaccine2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 6,
    name: "Gestão Animal",
    href: "/gerenciar",
    iconSrc: farm2,
    className: "h-14 w-14 object-cover",
  },
  {
    id: 7,
    name: "Medidas",
    href: "/pesagem-ce",
    iconSrc: weigths2,
    className: "h-14 w-14 object-cover",
  },
  {
    id: 8,
    name: "Estoque de Sêmen",
    href: "/gerenciar/doses-semen",
    iconSrc: semen,
    className: "h-12 w-10 object-cover",
  },
  {
    id: 9,
    name: "Importar",
    href: "/importar",
    iconSrc: importIcon2,
    className: "h-12 w-12 object-cover",
  },
  {
    id: 10,
    name: "Relatórios",
    href: "/geral",
    iconSrc: reports2,
    className: "h-12 w-12 object-cover",
  },
];
