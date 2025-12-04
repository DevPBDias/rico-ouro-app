import { StaticImageData } from "next/image";

export interface Links {
  id: number;
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }> | string;
  iconSrc?: string | StaticImageData;
  className?: string;
}
