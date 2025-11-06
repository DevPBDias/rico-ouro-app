import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimalData } from "@/lib/db";

interface Props {
  formData: AnimalData;
  handleChange: (path: string, value: string) => void;
  isSaving: boolean;
}

const IdentificacaoSection = ({ formData, handleChange, isSaving }: Props) => {
  const fields = [
    { label: "Série RGD", key: "animal.serieRGD" },
    { label: "RGN", key: "animal.rgn", required: true },
    { label: "Nome", key: "animal.nome", colSpan: 2 },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="uppercase font-bold text-primary text-base pb-1 border-[#1162AE] border-b w-full">
          Identificação
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`flex flex-col space-y-1.5 ${
              f.colSpan === 2 ? "col-span-2" : ""
            }`}
          >
            <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1">
              {f.label}
              {f.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={
                f.key.split(".").reduce((o: any, k) => o?.[k], formData) || ""
              }
              onChange={(e) => handleChange(f.key, e.target.value)}
              disabled={isSaving}
              className="border-[#1162AE]/30 focus-visible:ring-2 focus-visible:ring-[#1162AE] h-9"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default IdentificacaoSection;
