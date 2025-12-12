import { Links } from "@/types/links.type";

const detailsAnimalLinks: Links[] = [
  {
    id: 1,
    name: "Detalhes do animal",
    href: "/animals/:id/detalhes",
  },
  {
    id: 3,
    name: "Pesagem",
    href: "/animals/:id/pesagem",
  },
  {
    id: 4,
    name: "CE",
    href: "/animals/:id/ce",
  },
  {
    id: 2,
    name: "Gráficos",
    href: "/animals/:id/graficos",
  },
];

export default detailsAnimalLinks;
