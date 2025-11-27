"use client";

import { MatrizDocType } from "@/types/database.types";
import { Eye } from "lucide-react";
import Link from "next/link";

interface MatrizCardProps {
  data: MatrizDocType;
}

export function MatrizCard({ data }: MatrizCardProps) {
  return (
    <Link
      href={`/matrizes/${data.uuid}`}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {data.serieRGD} {data.rgn}
        </div>
        <div className="text-sm text-gray-500">
          {data.iabcgz && `Sexo: ${data.iabcgz}`}
          {data.deca && ` • DECA: ${data.deca}`}
        </div>
      </div>
      <Eye className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
