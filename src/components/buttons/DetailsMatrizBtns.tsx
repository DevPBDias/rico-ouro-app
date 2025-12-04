import { Links } from "@/types/links.type";
import { useRouter } from "next/navigation";

interface DetailsMatrizButtonsProps {
  data: Links[];
  className?: string;
  matrizId: string;
}

const DetailsMatrizButtons = ({
  data,
  className,
  matrizId,
}: DetailsMatrizButtonsProps) => {
  const router = useRouter();

  return (
    <section
      className={`rounded-3xl z-10 ${className} w-full bg-transparent px-4 py-10 grid gap-2`}
    >
      {data.map((link: Links) => (
        <button
          key={link.id}
          onClick={() => router.push(link.href.replace(":id", matrizId))}
          className={`bg-[#1162AE] text-white w-full pl-4 py-3 rounded-md flex flex-row justify-start items-center font-medium text-sm uppercase shadow-lg gap-2 text-left `}
        >
          {link.name}
        </button>
      ))}
    </section>
  );
};

export default DetailsMatrizButtons;
