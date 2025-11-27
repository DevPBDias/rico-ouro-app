"use client";

import { AnimalData } from "@/types/schemas.types";
import { Eye } from "lucide-react";
import Link from "next/link";

interface AnimalCardProps {
  animal: AnimalData;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <Link
      href={`/bois/${animal.uuid}`}
      className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {animal.animal.serieRGD} {animal.animal.rgn}
        </div>
        <div className="text-sm text-gray-500">
          {animal.animal.sexo && `Sexo: ${animal.animal.sexo}`}
          {animal.animal.deca && ` • DECA: ${animal.animal.deca}`}
        </div>
      </div>
      <Eye className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
