"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Animal } from "@/types/animal.type";
import { toast } from "sonner";

interface CowSearchInputProps {
  matrizes: Animal[];
  onAddCow: (cow: Animal) => void;
  isLoading?: boolean;
}

export function CowSearchInput({ matrizes, onAddCow, isLoading }: CowSearchInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-foco na montagem
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const rgn = inputValue.trim().toUpperCase();
      
      if (!rgn) return;

      const foundCow = matrizes.find((m) => m.rgn && m.rgn.toUpperCase() === rgn);

      if (foundCow) {
        onAddCow(foundCow);
        setInputValue(""); // Limpa para a próxima entrada rápida
      } else {
        toast.error(`A matriz com RGN ${rgn} não foi encontrada no rebanho.`);
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        className="pl-10 py-6 text-lg bg-card border-border shadow-sm rounded-xl focus:ring-primary focus:border-primary placeholder:text-muted-foreground placeholder:text-sm"
        placeholder="Digite o RGN e pressione Enter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
    </div>
  );
}
