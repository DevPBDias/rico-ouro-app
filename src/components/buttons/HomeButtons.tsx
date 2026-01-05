import { Links } from "@/types/links.type";
import Image from "next/image";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
}

const HomeButtons = ({ data }: RedirectButtonsProps) => {
  return (
    <section className="grid w-full grid-cols-5 gap-1.5 px-2.5">
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="flex aspect-[1/1.5] w-full flex-col items-center justify-center gap-2 rounded-lg bg-white p-1 text-center shadow-xl active:scale-95 transition-all uuration-300"
        >
          <div className="flex items-center justify-center h-14 w-full">
            {link.icon ? (
              typeof link.icon === "string" ? (
                <span className="text-2xl">{link.icon}</span>
              ) : (
                <link.icon className="h-8 w-8 text-primary" />
              )
            ) : link.iconSrc ? (
              <Image
                src={link.iconSrc}
                alt={link.name}
                className={link.className}
              />
            ) : null}
          </div>
          <span className="text-[10px] font-black uppercase text-primary px-0.5">
            {link.name}
          </span>
        </Link>
      ))}
    </section>
  );
};

export default HomeButtons;
