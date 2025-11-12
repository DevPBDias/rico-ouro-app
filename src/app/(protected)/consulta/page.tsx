import Header from "@/components/layout/Header";
import SearchAnimal from "@/components/search/SearchAnimal";

const ConsultAnimals = () => {
  return (
    <main className="w-full h-dvh">
      <Header title="Consulta" />
      <SearchAnimal />
    </main>
  );
};

export default ConsultAnimals;
