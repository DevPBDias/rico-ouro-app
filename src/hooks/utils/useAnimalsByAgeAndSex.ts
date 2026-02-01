"use client";

import { useMemo } from "react";
import { Animal } from "@/types/animal.type";
import { calculateAgeInMonths, getAgeRange } from "@/utils/formatDates";

interface AnimalsByAgeAndSex {
  male: {
    "0 - 12 m": Animal[];
    "13 - 24 m": Animal[];
    "25 - 36 m": Animal[];
    "+37 m": Animal[];
  };
  female: {
    "0 - 12 m": Animal[];
    "13 - 24 m": Animal[];
    "25 - 36 m": Animal[];
    "+37 m": Animal[];
  };
  total: {
    male: number;
    female: number;
    all: number;
  };
  byAge: {
    "0 - 12 m": number;
    "13 - 24 m": number;
    "25 - 36 m": number;
    "+37 m": number;
  };
}

export { calculateAgeInMonths, getAgeRange };

export function useAnimalsByAgeAndSex(animals: Animal[]): AnimalsByAgeAndSex {
  return useMemo(() => {
    const result: AnimalsByAgeAndSex = {
      male: {
        "0 - 12 m": [],
        "13 - 24 m": [],
        "25 - 36 m": [],
        "+37 m": [],
      },
      female: {
        "0 - 12 m": [],
        "13 - 24 m": [],
        "25 - 36 m": [],
        "+37 m": [],
      },
      total: {
        male: 0,
        female: 0,
        all: 0,
      },
      byAge: {
        "0 - 12 m": 0,
        "13 - 24 m": 0,
        "25 - 36 m": 0,
        "+37 m": 0,
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
