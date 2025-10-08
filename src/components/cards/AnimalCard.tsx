"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { AnimalData } from "@/lib/db";

interface AnimalCardProps {
  animal: AnimalData;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const displayName =
    animal.animal.rgn || animal.animal.serieRGD || "Sem identificação";

  return (
    <Link
      href={`/bois/${animal.id}`}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex-1">
        <div className="font-medium text-gray-800">{displayName}</div>
        <div className="text-sm text-gray-500">
          {animal.animal.sexo && `Sexo: ${animal.animal.sexo}`}
          {animal.animal.deca && ` • DECA: ${animal.animal.deca}`}
        </div>
      </div>
      <Eye className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
