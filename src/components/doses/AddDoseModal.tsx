"use client";

import { useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Plus, Minus, Loader2, X, ImageIcon } from "lucide-react";
import { uploadDoseImage, compressImage } from "@/lib/supabase/storage";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

interface AddDoseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    animal_name: string;
    breed: string;
    quantity: number;
    animal_image?: string;
    father_name?: string;
    maternal_grandfather_name?: string;
    iabcz?: string;
    registration?: string;
    center_name?: string;
  }) => void;
  existingBreeds: string[];
}

export function AddDoseModal({
  open,
  onClose,
  onAdd,
  existingBreeds,
}: AddDoseModalProps) {
  const [animalName, setAnimalName] = useState("");
  const [animalImage, setAnimalImage] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [maternalGrandfatherName, setMaternalGrandfatherName] = useState("");
  const [iabcz, setIabcz] = useState("");
  const [registration, setRegistration] = useState("");
  const [centerName, setCenterName] = useState("");
  const [breed, setBreed] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a temporary ID for image upload folder context if needed
  // or just use a new UUID
  const tempId = useMemo(() => uuidv4(), [open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const compressedFile = await compressImage(file, 800, 0.8);
      const result = await uploadDoseImage(compressedFile, tempId);

      if (result.success && result.url) {
        setAnimalImage(result.url);
      } else {
        setError(result.error || "Erro ao fazer upload da imagem");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Erro ao processar a imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setAnimalImage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!animalName.trim()) {
      setError("Nome do animal é obrigatório");
      return;
    }

    if (!breed.trim()) {
      setError("Raça é obrigatória");
      return;
    }

    if (quantity < 0) {
      setError("Quantidade não pode ser negativa");
      return;
    }

    onAdd({
      animal_name: animalName.trim(),
      breed: breed.trim(),
      quantity,
      animal_image: animalImage,
      father_name: fatherName.trim(),
      maternal_grandfather_name: maternalGrandfatherName.trim(),
      iabcz: iabcz.trim(),
      registration: registration.trim(),
      center_name: centerName.trim(),
    });

    handleClose();
  };

  const handleClose = () => {
    setAnimalName("");
    setAnimalImage("");
    setFatherName("");
    setMaternalGrandfatherName("");
    setIabcz("");
    setRegistration("");
    setCenterName("");
    setBreed("");
    setQuantity(1);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Adicionar Novo Animal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/30">
              {animalImage ? (
                <>
                  <Image
                    src={animalImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                    crossOrigin="anonymous"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-[10px]">Foto</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
              {animalImage ? "Trocar" : "Adicionar Foto"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="animalName"
                className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
              >
                Nome do Animal *
              </label>
              <Input
                id="animalName"
                value={animalName}
                onChange={(e) => setAnimalName(e.target.value)}
                placeholder="Ex: Touro X123"
                className="py-4 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="breed"
                className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
              >
                Raça *
              </label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ex: Nellore"
                list="add-breed-suggestions"
                className="py-4 text-sm"
              />
              <datalist id="add-breed-suggestions">
                {existingBreeds.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="fatherName"
                  className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
                >
                  Pai
                </label>
                <Input
                  id="fatherName"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Nome do pai"
                  className="py-4 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="maternalGrandfatherName"
                  className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
                >
                  Avô Materno
                </label>
                <Input
                  id="maternalGrandfatherName"
                  value={maternalGrandfatherName}
                  onChange={(e) => setMaternalGrandfatherName(e.target.value)}
                  placeholder="Avô materno"
                  className="py-4 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="iabcz"
                  className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
                >
                  IABCZ
                </label>
                <Input
                  id="iabcz"
                  value={iabcz}
                  onChange={(e) => setIabcz(e.target.value)}
                  placeholder="0.0"
                  className="py-4 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="registration"
                  className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
                >
                  Registro
                </label>
                <Input
                  id="registration"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="RGN"
                  className="py-4 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="centerName"
                className="text-[10px] font-bold uppercase text-muted-foreground ml-1"
              >
                Central
              </label>
              <Input
                id="centerName"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="Nome da central"
                className="py-4 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-muted/50 p-4 rounded-xl">
            <label className="text-xs font-bold uppercase text-muted-foreground text-center">
              Quantidade Inicial
            </label>
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 font-bold"
                onClick={() => setQuantity(Math.max(0, quantity - 5))}
                disabled={quantity < 5}
              >
                -5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                disabled={quantity <= 0}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-3xl font-bold text-primary w-16 text-center tabular-nums">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 font-bold"
                onClick={() => setQuantity(quantity + 5)}
              >
                +5
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 mt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold uppercase text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1 h-12 rounded-xl font-bold uppercase text-xs shadow-lg shadow-primary/20"
            >
              {isUploading ? "Enviando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


