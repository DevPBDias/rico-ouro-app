"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { MatrizItem } from "@/hooks/useMatrizDB";

interface MatrizCardProps {
  data: MatrizItem;
}

export function MatrizCard({ data }: MatrizCardProps) {
  return (
    <Link
      href={`/bois/${data.matriz.rgn}`}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {data.matriz.serieRGD} {data.matriz.rgn}
        </div>
        <div className="text-sm text-gray-500">
          {data.matriz.iabcgz && `Sexo: ${data.matriz.iabcgz}`}
          {data.matriz.deca && ` • DECA: ${data.matriz.deca}`}
        </div>
      </div>
      <Eye className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
