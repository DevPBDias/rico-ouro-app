"use client";

import { useBoisList } from "@/hooks/useBoisList";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, Trash2, Eye } from "lucide-react";

export default function BoisPage() {
  const {
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    handlePageChange,
    limpar,
    excluirPorRgn,
    query,
    setQuery,
    sexo,
    setSexo,
    parentQuery,
    setParentQuery,
  } = useBoisList({ itemsPerPage: 10 });
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gado</h1>
            <p className="text-gray-600">Gerencie seus animais</p>
          </div>
          <Button
            onClick={limpar}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir tudo
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por RGN ou Série/RGD"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os sexos</option>
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
            </select>
            <Input
              placeholder="Filtrar por nome do pai ou dados da mãe"
              value={parentQuery}
              onChange={(e) => setParentQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {paginatedData.length} de {filtered.length} registros
            </div>
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RGN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Série/RGD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DECA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mae
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((a) => (
                  <tr
                    key={String(a.id)}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {a.animal.rgn ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {a.animal.serieRGD ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {a.animal.sexo ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {a.animal.deca ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {a.mae.serieRGD + "-" + a.mae.rgn}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {a.pai.nome ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/bois/${a.id}`)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {a.animal.rgn && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => excluirPorRgn(a.animal.rgn!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t bg-gray-50 mb-16">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
