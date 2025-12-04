import { ReproductionEvent } from "@/types/reproduction_event.type";
import { RxJsonSchema } from "rxdb";

export const reproductionEventSchema: RxJsonSchema<ReproductionEvent> = {
  title: "reproduction schema",
  version: 2,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    rgn: { type: "string", maxLength: 10 },
    type: { type: "string", maxLength: 20 },
    date: { type: "string", format: "date" },
    weight: { type: "string" },
    bull: { type: "string" },
    rgn_bull: { type: "string" },
    donor: { type: "string" },
    gestation_diagnostic_date: { type: "string", format: "date" },
    gestation_diagnostic_type: { type: "string" },
    expected_sex: { type: "string" },
    expected_birth_date_270: { type: "string", format: "date" },
    expected_birth_date_305: { type: "string", format: "date" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "rgn", "type"],
  indexes: ["rgn", "type"],
};
