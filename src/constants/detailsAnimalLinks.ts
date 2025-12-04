import { Links } from "@/types/links.type";

const detailsAnimalLinks: Links[] = [
  {
    id: 1,
    name: "Detalhes do animal",
    href: "/bois/:id/detalhes",
  },
  {
    id: 3,
    name: "Pesagem",
    href: "/bois/:id/pesagem",
  },
  {
    id: 4,
    name: "CE",
    href: "/bois/:id/ce",
  },
  {
    id: 2,
    name: "Gráficos",
    href: "/bois/:id/graficos",
  },
];

export default detailsAnimalLinks;
