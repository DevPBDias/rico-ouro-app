"use client";

import { useMemo } from "react";
import { Animal } from "@/types/animal.type";

type AgeRange = "0 - 12 m" | "12 - 24 m" | "24 - 36 m" | "+36 m";

interface AnimalsByAgeAndSex {
  male: {
    "0 - 12 m": Animal[];
    "12 - 24 m": Animal[];
    "24 - 36 m": Animal[];
    "+36 m": Animal[];
  };
  female: {
    "0 - 12 m": Animal[];
    "12 - 24 m": Animal[];
    "24 - 36 m": Animal[];
    "+36 m": Animal[];
  };
  total: {
    male: number;
    female: number;
    all: number;
  };
  byAge: {
    "0 - 12 m": number;
    "12 - 24 m": number;
    "24 - 36 m": number;
    "+36 m": number;
  };
}

function calculateAgeInMonths(birthDate: string | undefined): number {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const now = new Date();

  const yearsDiff = now.getFullYear() - birth.getFullYear();
  const monthsDiff = now.getMonth() - birth.getMonth();

  return yearsDiff * 12 + monthsDiff;
}

function getAgeRange(months: number): AgeRange {
  if (months <= 12) {
    return "0 - 12 m";
  } else if (months <= 24 && months > 12) {
    return "12 - 24 m";
  } else if (months <= 36 && months > 24) {
    return "24 - 36 m";
  } else {
    return "+36 m";
  }
}

export { calculateAgeInMonths, getAgeRange };

export function useAnimalsByAgeAndSex(animals: Animal[]): AnimalsByAgeAndSex {
  return useMemo(() => {
    const result: AnimalsByAgeAndSex = {
      male: {
        "0 - 12 m": [],
        "12 - 24 m": [],
        "24 - 36 m": [],
        "+36 m": [],
      },
      female: {
        "0 - 12 m": [],
        "12 - 24 m": [],
        "24 - 36 m": [],
        "+36 m": [],
      },
      total: {
        male: 0,
        female: 0,
        all: 0,
      },
      byAge: {
        "0 - 12 m": 0,
        "12 - 24 m": 0,
        "24 - 36 m": 0,
        "+36 m": 0,
      },
    };

    animals.forEach((animal) => {
      const months = calculateAgeInMonths(animal.born_date);
      const ageRange = getAgeRange(months);
      const sex = animal.sex;

      if (sex === "M") {
        result.male[ageRange].push(animal);
        result.total.male++;
      } else if (sex === "F") {
        result.female[ageRange].push(animal);
        result.total.female++;
      }

      result.byAge[ageRange]++;
      result.total.all++;
    });

    return result;
  }, [animals]);
}
