"use client";

/**
 * EXEMPLO DE PÁGINA DINÂMICA COM SUPORTE OFFLINE COMPLETO
 *
 * Este arquivo demonstra como criar uma página de detalhes de animal
 * que funciona 100% offline usando a estratégia App Shell + RXDB.
 *
 * Pontos-chave:
 * 1. "use client" - Necessário para client-side rendering
 * 2. Usar hooks que buscam do RXDB (useAnimalById, useAnimalWeights, etc.)
 * 3. Estados de loading com skeleton
 * 4. Tratamento de "não encontrado" com contexto offline
 */

import { use, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useAnimalWeights } from "@/hooks/db/animal_weights";
import { useAnimalCE } from "@/hooks/db/animal_ce";

// Componentes de UI
import { DetailsSkeleton } from "@/components/skeletons/DetailsSkeleton";
import { useOfflineStatus } from "@/hooks/sync/useOfflineStatus";
import { WifiOff, AlertCircle } from "lucide-react";

interface DetailsAnimalExamplePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página de exemplo com suporte offline completo
 */
const DetailsAnimalExamplePage = ({
  params,
}: DetailsAnimalExamplePageProps) => {
  // 1. Extrair o ID da rota dinâmica
  const { id } = use(params);
  const { isOnline } = useOfflineStatus();

  // 2. Buscar dados do RXDB (funciona offline!)
  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const { weights, isLoading: weightsLoading } = useAnimalWeights(id);
  const { metrics: ceMetrics, isLoading: ceLoading } = useAnimalCE(id);
  const { farms } = useFarms();

  // 3. Calcular dados derivados
  const isLoading =
    animalLoading ||
    vaccinesLoading ||
    allVaccinesLoading ||
    weightsLoading ||
    ceLoading;

  const farmName = useMemo(() => {
    if (!animal?.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === animal.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [animal?.farm_id, farms]);

  // 4. Estado de Loading - Mostrar skeleton
  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4">
          <DetailsSkeleton />
          {/* Indicador visual de modo offline */}
          {!isOnline && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm">
              <WifiOff className="w-4 h-4" />
              <span>Carregando dados locais...</span>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 5. Animal não encontrado - Tratamento especial para offline
  if (!animal) {
    return (
      <main>
        <Header title="Não encontrado" />
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Animal não encontrado
            </h2>

            {isOnline ? (
              <p className="text-muted-foreground mb-6">
                O animal solicitado não existe ou foi removido.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  Este animal não está disponível offline.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-500">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-medium">Você está offline</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Visite a página deste animal online primeiro para
                  disponibilizá-la offline.
                </p>
              </>
            )}

            <a
              href="/bois"
              className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Lista de Animais
            </a>
          </div>
        </div>
      </main>
    );
  }

  // 6. Renderizar dados do animal (funciona 100% offline!)
  return (
    <main>
      <Header title={`${animal.serie_rgd || ""} ${animal.rgn}`} />

      <div className="p-4 space-y-6">
        {/* Indicador de modo offline */}
        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Visualizando dados salvos localmente</span>
          </div>
        )}

        {/* Dados Básicos */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Dados Básicos
          </h3>
          <div className="space-y-2">
            <InfoRow label="RGN" value={animal.rgn} />
            <InfoRow label="Série/RGD" value={animal.serie_rgd} />
            <InfoRow label="Fazenda" value={farmName} />
            <InfoRow label="Nascimento" value={animal.born_date} />
            <InfoRow
              label="Sexo"
              value={animal.sex === "M" ? "Macho" : "Fêmea"}
            />
          </div>
        </div>

        {/* Pesos */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Histórico de Pesos ({weights?.length || 0} registros)
          </h3>
          {weights && weights.length > 0 ? (
            <ul className="space-y-1">
              {weights.slice(0, 5).map((w, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{w.date}</span>
                  <span className="font-medium">{w.value} kg</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum peso registrado
            </p>
          )}
        </div>

        {/* Vacinas */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Vacinas ({animalVaccines?.length || 0} registros)
          </h3>
          {animalVaccines && animalVaccines.length > 0 ? (
            <ul className="space-y-1">
              {animalVaccines.map((av) => {
                const vaccineName = vaccines.find(
                  (v) => v.id === av.vaccine_id
                )?.vaccine_name;
                return (
                  <li key={av.id} className="flex justify-between text-sm">
                    <span className="font-medium text-primary">
                      {vaccineName || "Vacina"}
                    </span>
                    <span className="text-muted-foreground">{av.date}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma vacina registrada
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

// Componente auxiliar para linhas de info
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center border-b border-border py-1 last:border-0">
      <span className="text-xs text-gray-500 uppercase">{label}</span>
      <span className="text-sm font-semibold text-primary">{value || "-"}</span>
    </div>
  );
}

export default DetailsAnimalExamplePage;

/**
 * =============================================================================
 * COMO FUNCIONA OFFLINE:
 * =============================================================================
 *
 * 1. PRIMEIRA VISITA (ONLINE):
 *    - Usuário acessa /bois/abc123/detalhes
 *    - Next.js renderiza a página no servidor e envia HTML
 *    - Service Worker cacheia o HTML no CacheStorage
 *    - RXDB sincroniza dados com Supabase e salva no IndexedDB
 *
 * 2. VISITA OFFLINE SUBSEQUENTE:
 *    - Usuário acessa /bois/abc123/detalhes (sem internet)
 *    - Service Worker detecta modo de navegação + offline
 *    - SW serve o App Shell (/) do cache
 *    - Next.js inicia e detecta a rota /bois/abc123/detalhes
 *    - useAnimalById(id) busca do RXDB/IndexedDB
 *    - React renderiza com dados 100% locais
 *
 * 3. VISITA OFFLINE SEM CACHE PRÉVIO:
 *    - Se a página nunca foi visitada online
 *    - Service Worker ainda serve o App Shell
 *    - useAnimalById retorna null (animal não no IndexedDB)
 *    - UI mostra "Animal não disponível offline"
 *
 * =============================================================================
 * PRÉ-CACHE PROATIVO:
 * =============================================================================
 *
 * Para evitar o cenário 3, use useCacheDynamicRoutes na página de lista:
 *
 * ```tsx
 * // Em /bois/page.tsx
 * import { useCacheDynamicRoutes, routePatterns } from "@/hooks/useCacheDynamicRoutes";
 *
 * const BoisPage = () => {
 *   const { animals } = useAnimalsList();
 *   const ids = animals.map(a => a.rgn);
 *
 *   // Pré-cacheia rotas de detalhes em background
 *   useCacheDynamicRoutes(ids, routePatterns.boi, "bois");
 *
 *   return <Lista />;
 * };
 * ```
 *
 * Isso faz o SW baixar e cachear as páginas de detalhes em background,
 * permitindo acesso offline mesmo antes de visitar cada página.
 *
 * =============================================================================
 */
