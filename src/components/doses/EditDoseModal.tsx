"use client";

import { useState, useRef, useEffect } from "react";
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
import { SemenDose } from "@/types/semen_dose.type";
import { uploadDoseImage, compressImage } from "@/lib/supabase/storage";
import Image from "next/image";

interface EditDoseModalProps {
  open: boolean;
  onClose: () => void;
  dose: SemenDose | null;
  onSave: (data: Partial<SemenDose>) => void;
  existingBreeds: string[];
}

export function EditDoseModal({
  open,
  onClose,
  dose,
  onSave,
  existingBreeds,
}: EditDoseModalProps) {
  const [animalName, setAnimalName] = useState("");
  const [animalImage, setAnimalImage] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [maternalGrandfatherName, setMaternalGrandfatherName] = useState("");
  const [iabcz, setIabcz] = useState("");
  const [registration, setRegistration] = useState("");
  const [centerName, setCenterName] = useState("");
  const [breed, setBreed] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dose) {
      setAnimalName(dose.animal_name || "");
      setAnimalImage(dose.animal_image || "");
      setFatherName(dose.father_name || "");
      setMaternalGrandfatherName(dose.maternal_grandfather_name || "");
      setIabcz(dose.iabcz || "");
      setRegistration(dose.registration || "");
      setCenterName(dose.center_name || "");
      setBreed(dose.breed || "");
      setQuantity(dose.quantity || 0);
    }
  }, [dose]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dose) return;

    setIsUploading(true);
    setError(null);

    try {
      // Compress the image before upload
      const compressedFile = await compressImage(file, 800, 0.8);

      // Upload to Supabase Storage
      const result = await uploadDoseImage(compressedFile, dose.id);

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

    onSave({
      animal_name: animalName.trim(),
      animal_image: animalImage,
      father_name: fatherName.trim(),
      maternal_grandfather_name: maternalGrandfatherName.trim(),
      iabcz: iabcz.trim(),
      registration: registration.trim(),
      center_name: centerName.trim(),
      breed: breed.trim(),
      quantity,
    });

    onClose();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!dose) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Dose</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-primary/30">
              {animalImage ? (
                <>
                  <Image
                    src={animalImage}
                    alt={animalName}
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
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span className="text-xs">Sem imagem</span>
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
              className="gap-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  {animalImage ? "Trocar Foto" : "Adicionar Foto"}
                </>
              )}
            </Button>
          </div>

          {/* Animal Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="animalName"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Nome do Animal *
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="animalName"
              value={animalName}
              onChange={(e) => setAnimalName(e.target.value)}
              placeholder="Ex: Touro X123"
            />
          </div>

          {/* Breed */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="breed"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Raça *
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex: Nellore"
              list="breed-suggestions"
            />
            {existingBreeds.length > 0 && (
              <datalist id="breed-suggestions">
                {existingBreeds.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            )}
          </div>

          {/* Father Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="fatherName"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Nome do Pai
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="fatherName"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="Ex: Pai ABC"
            />
          </div>

          {/* Maternal Grandfather Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="maternalGrandfatherName"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Avô Materno
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="maternalGrandfatherName"
              value={maternalGrandfatherName}
              onChange={(e) => setMaternalGrandfatherName(e.target.value)}
              placeholder="Ex: Avô XYZ"
            />
          </div>

          {/* IABCZ */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="iabcz"
              className="text-[11px] font-bold uppercase text-primary"
            >
              IABCZ
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="iabcz"
              value={iabcz}
              onChange={(e) => setIabcz(e.target.value)}
              placeholder="Ex: 10.00"
            />
          </div>

          {/* Registration */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="registration"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Registro
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              placeholder="Ex: RGN-12345"
            />
          </div>

          {/* Center Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="centerName"
              className="text-[11px] font-bold uppercase text-primary"
            >
              Central
            </label>
            <Input
              className="text-sm placeholder:text-sm"
              id="centerName"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              placeholder="Ex: Central XYZ"
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-primary">
              Quantidade
            </label>
            <div className="flex items-center justify-center gap-1 bg-muted p-3 rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 text-xs font-bold"
                onClick={() => setQuantity(Math.max(0, quantity - 5))}
                disabled={quantity < 5}
              >
                -5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                disabled={quantity <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold text-primary w-14 text-center tabular-nums">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 text-xs font-bold"
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
              className="flex-1 rounded-lg font-semibold uppercase text-xs py-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1 rounded-lg font-semibold uppercase text-xs py-5 shadow-lg shadow-primary/20"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
