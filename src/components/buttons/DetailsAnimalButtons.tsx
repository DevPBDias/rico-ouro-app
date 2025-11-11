import { Links } from "@/types";
import { useParams, useRouter } from "next/navigation";

interface DetailsAnimalButtonsProps {
  data: Links[];
  className?: string;
}

const DetailsAnimalButtons = ({
  data,
  className,
}: DetailsAnimalButtonsProps) => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  return (
    <section
      className={`rounded-3xl z-10 ${className} w-full bg-transparent px-4 py-10 grid gap-2`}
    >
      {data.map((link: Links) => (
        <button
          key={link.id}
          onClick={() => router.push(link.href.replace(":id", id.toString()))}
          className={`bg-[#1162AE] text-white w-full pl-4 py-3 rounded-md flex flex-row justify-start items-center font-medium text-sm uppercase shadow-lg gap-2 text-left `}
        >
          {link.name}
        </button>
      ))}
    </section>
  );
};

export default DetailsAnimalButtons;
