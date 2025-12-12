"use client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useState } from "react";

const AdminFarmPage = () => {
  const [selectedTab, setSelectedTab] = useState("farms");
  const { farms, isLoading, error } = useFarms();
  return (
    <main>
      <Header title="Gestão" />
      <div className="flex items-center gap-2">
        <Button variant="default" onClick={() => setSelectedTab("farms")}>
          Fazendas
        </Button>
        <Button variant="default" onClick={() => setSelectedTab("status")}>
          Status
        </Button>
      </div>

      {selectedTab === "farms" && (
        <div>
          <div>
            <h1>Fazendas</h1>
            <Button variant="default">Adicionar fazenda</Button>
          </div>
          <div>
            {isLoading && <p>Carregando fazendas...</p>}
            {error && <p>Erro ao carregar fazendas</p>}
            {farms && farms.length === 0 && <p>Nenhuma fazenda encontrada</p>}
            {farms && farms.length > 0 && (
              <ul>
                {farms.map((farm) => (
                  <li key={farm.id}>{farm.farm_name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {selectedTab === "status" && (
        <div>
          <h1>Status</h1>
          <Button variant="default">Adicionar status</Button>
        </div>
      )}
    </main>
  );
};

export default AdminFarmPage;
