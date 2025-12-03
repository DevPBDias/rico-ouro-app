import { Links } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
}

const HomeButtons = ({ data }: RedirectButtonsProps) => {
  return (
    <section className="grid w-full grid-cols-4 gap-1.5 px-2.5">
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border border-primary bg-white p-2 text-center shadow-sm"
        >
          {link.iconSrc && (
            <Image
              src={link.iconSrc}
              alt={link.name}
              width={32}
              height={32}
              className={link.className}
            />
          )}
          <span className="text-[10px] font-bold uppercase leading-tight text-primary">
            {link.name}
          </span>
        </Link>
      ))}
    </section>
  );
};

export default HomeButtons;
