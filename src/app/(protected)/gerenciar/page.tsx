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

      <div className="p-4 space-y-4">
        {/* Selector Section */}
        <div className="space-y-3">
          {!selectedAnimal ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-700 ease-in-out">
              <label
                htmlFor="rgn"
                className="text-primary font-bold text-xs uppercase block mb-2"
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
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex justify-between items-center animate-in zoom-in-95 duration-300 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase mb-0.5">
                  Animal Selecionado
                </span>
                <p className="text-xl font-black text-primary leading-none">
                  {selectedAnimal.rgn}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-destructive/70 hover:text-white hover:bg-destructive h-10 w-10 p-0 rounded-xl transition-all group border border-destructive/10"
              >
                <X className="w-5 h-5 group-hover:scale-110" />
              </Button>
            </div>
          )}
        </div>

        {/* Tabs Section */}
        {selectedAnimal && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Tabs
              defaultValue="fazenda"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
                <TabsList className="flex w-max min-w-full bg-muted/30 rounded-xl p-1 mb-1 h-auto gap-0.5 border border-border">
                  <TabsTrigger
                    value="fazenda"
                    className="flex-1 min-w-[75px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                  >
                    Fazenda
                  </TabsTrigger>
                  <TabsTrigger
                    value="status"
                    className="flex-1 min-w-[75px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                  >
                    Status
                  </TabsTrigger>
                  <TabsTrigger
                    value="classe"
                    className="flex-1 min-w-[75px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                  >
                    Classe
                  </TabsTrigger>
                  <TabsTrigger
                    value="sociedade"
                    className="flex-1 min-w-[75px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                  >
                    Sociedade
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-2">
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
