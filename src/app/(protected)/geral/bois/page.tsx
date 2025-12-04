"use client";

import { useAnimalsList } from "@/hooks/db/animals/useAnimalsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, Trash2, Eye } from "lucide-react";
import Header from "@/components/layout/Header";

export default function BoisPage() {
  const {
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    handlePageChange,
    excluirPorRgn,
    query,
    setQuery,
    sexo,
    setSexo,
    parentQuery,
    setParentQuery,
  } = useAnimalsList({ itemsPerPage: 10 });

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="Animais" />
      <div className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por RGN"
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
          <div className="px-4 py-3 border-b bg-gray-50 flex flex-col justify-center items-start">
            <div className="text-base font-medium text-gray-600 mb-2">
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RGN
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Série/RGD
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DECA
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mae
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pai
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    iABCz
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((a) => (
                  <tr
                    key={a.rgn}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {a.rgn ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.serie_rgd ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.sex ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.deca ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.mother_serie_rgd && a.mother_rgn
                        ? `${a.mother_serie_rgd}-${a.mother_rgn}`
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.father_name ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.iabcgz ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm flex items-center gap-2">
                      <Link
                        href={`/bois/${a.rgn}`}
                        prefetch
                        className="inline-flex items-center justify-center px-2 py-1 text-sm border rounded-md text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {a.rgn && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => excluirPorRgn(a.rgn!)}
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
                      colSpan={8}
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
    </main>
  );
}
