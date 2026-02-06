import { Links } from "@/types/links.type";
import consult2 from "@/assets/icons/consult2.png";
import vaccine2 from "@/assets/icons/vaccine2.png";
import farm2 from "@/assets/icons/farm2.png";
import weigths2 from "@/assets/icons/weigths2.png";
import reports2 from "@/assets/icons/reports2.png";
import reproduction from "@/assets/icons/reproduction_bov.png";
import semen from "@/assets/icons/semen.png";
import movimentacoes from "@/assets/icons/movimentacoes.png";
import borns2 from "@/assets/icons/borns2.png";
import { HandCoins } from "lucide-react";

export const homeLinks: Links[] = [
  {
    id: 1,
    name: "Consulta Animal",
    href: "/consulta",
    iconSrc: consult2,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 2,
    name: "Gestão Animal",
    href: "/gerenciar",
    iconSrc: farm2,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 3,
    name: "Medidas",
    href: "/pesagem-ce",
    iconSrc: weigths2,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 4,
    name: "Nascimento",
    href: "/nascimentos",
    iconSrc: borns2,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 5,
    name: "Vacinas",
    href: "/vacinas",
    iconSrc: vaccine2,
    className: "h-13 w-13 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 6,
    name: "Movimentações",
    href: "/movimentacoes",
    iconSrc: movimentacoes,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[8px]",
  },
  {
    id: 7,
    name: "Reprodução",
    href: "/reproducao",
    iconSrc: reproduction,
    className: "h-14 w-14 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 8,
    name: "Estoque de Sêmen",
    href: "/gerenciar/doses-semen",
    iconSrc: semen,
    className: "h-14 w-12 object-cover",
    fontSize: "text-[9px]",
  },
  {
    id: 9,
    name: "Vendas Clientes",
    href: "/comercial",
    icon: HandCoins,
    className: "h-14 w-14 text-primary",
    fontSize: "text-[9px]",
  },
  {
    id: 10,
    name: "Relatórios",
    href: "/geral",
    iconSrc: reports2,
    className: "h-12 w-12 object-cover",
    fontSize: "text-[9px]",
  },
];
