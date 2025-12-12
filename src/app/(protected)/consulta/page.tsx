import ShortHeader from "@/components/layout/ShortHeader";
import SearchAnimal from "@/components/search/SearchAnimal";

const ConsultAnimals = () => {
  return (
    <main className="w-full h-dvh">
      <ShortHeader title="Consulta" />
      <SearchAnimal />
    </main>
  );
};

export default ConsultAnimals;
