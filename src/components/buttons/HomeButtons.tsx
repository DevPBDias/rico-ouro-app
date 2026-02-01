import { Links } from "@/types/links.type";
import Image from "next/image";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
}

const HomeButtons = ({ data }: RedirectButtonsProps) => {
  return (
    <section className="grid w-full grid-cols-5 gap-1 px-2">
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg bg-white p-2 shadow-xl active:scale-95 transition-all duration-300"
        >
          <div className="flex items-center justify-center h-16 w-full">
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
          <span className="text-[9px] font-black uppercase text-primary text-center">
            {link.name}
          </span>
        </Link>
      ))}
    </section>
  );
};

export default HomeButtons;
