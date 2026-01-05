"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { Animal } from "@/types/animal.type";
import { ManageFarms } from "@/components/manage/ManageFarms";
import { ManageStatus } from "@/components/manage/ManageStatus";
import { ManageClassification } from "@/components/manage/ManageClassification";
import { ManageSociety } from "@/components/manage/ManageSociety";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const GerenciarPage = () => {
  const { animals } = useAnimals();
  const [selectedRgn, setSelectedRgn] = useState("");
  const [activeTab, setActiveTab] = useState("fazenda");

  const selectedAnimal = useMemo(() => {
    if (!selectedRgn) return null;
    return animals.find(
      (a) => a.rgn?.toLowerCase() === selectedRgn.toLowerCase()
    );
  }, [selectedRgn, animals]);

  const rgnOptions = useMemo(() => {
    return animals
      .map((animal) => ({
        label: animal.rgn || "",
        value: animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [animals]);

  const handleClearSelection = () => {
    setSelectedRgn("");
  };

  return (
    <main className="min-h-screen bg-background pb-10">
      <Header title="Gerenciamento" />

      <div className="px-6 py-6 space-y-8">
        {/* Selector Section */}
        <div className="space-y-4">
          {!selectedAnimal ? (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <label
                htmlFor="rgn"
                className="text-primary font-bold text-sm uppercase block mb-2"
              >
                Buscar Animal (RGN):
              </label>
              <div className="relative">
                <RgnAutocomplete
                  options={rgnOptions}
                  value={selectedRgn}
                  onSelect={setSelectedRgn}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Selecione um animal para habilitar as opções de gerenciamento.
              </p>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl flex justify-between items-center animate-in zoom-in-95 duration-300 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Animal Selecionado
                </span>
                <p className="text-2xl font-black text-foreground leading-none">
                  {selectedAnimal.rgn}
                </p>
                <p className="text-sm font-semibold text-muted-foreground mt-1.5 italic">
                  {selectedAnimal.name || "Sem nome informado"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-primary hover:text-white hover:bg-destructive h-12 w-12 p-0 rounded-2xl transition-all group border border-primary/10"
              >
                <X className="w-6 h-6 group-hover:scale-110" />
              </Button>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        {selectedAnimal && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <Tabs
              defaultValue="fazenda"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                <TabsList className="flex w-max min-w-full bg-muted/30 rounded-2xl p-1.5 mb-2 h-auto gap-1 border border-border shadow-inner">
                  <TabsTrigger
                    value="fazenda"
                    className="flex-1 min-w-[80px] py-3.5 px-3 text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all rounded-xl"
                  >
                    Fazenda
                  </TabsTrigger>
                  <TabsTrigger
                    value="status"
                    className="flex-1 min-w-[80px] py-3.5 px-3 text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all rounded-xl"
                  >
                    Status
                  </TabsTrigger>
                  <TabsTrigger
                    value="classe"
                    className="flex-1 min-w-[80px] py-3.5 px-3 text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all rounded-xl"
                  >
                    Classe
                  </TabsTrigger>
                  <TabsTrigger
                    value="sociedade"
                    className="flex-1 min-w-[80px] py-3.5 px-3 text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all rounded-xl"
                  >
                    Sócios
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-4">
                <TabsContent
                  value="fazenda"
                  className="mt-0 ring-offset-background focus-visible:outline-none"
                >
                  <ManageFarms selectedAnimal={selectedAnimal} />
                </TabsContent>

                <TabsContent
                  value="status"
                  className="mt-0 ring-offset-background focus-visible:outline-none"
                >
                  <ManageStatus selectedAnimal={selectedAnimal} />
                </TabsContent>

                <TabsContent
                  value="classe"
                  className="mt-0 ring-offset-background focus-visible:outline-none"
                >
                  <ManageClassification selectedAnimal={selectedAnimal} />
                </TabsContent>

                <TabsContent
                  value="sociedade"
                  className="mt-0 ring-offset-background focus-visible:outline-none"
                >
                  <ManageSociety selectedAnimal={selectedAnimal} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </main>
  );
};

export default GerenciarPage;
