"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateOnly } from "@/utils/date_only";
import { parseToDate } from "@/utils/formatDates";

export interface DatePickerProps {
  value?: string | Date;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Selecione uma data",
  id,
  className,
  required,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = parseToDate(value);
    return parsed && isValid(parsed) ? parsed : undefined;
  }, [value]);

  return (
    <Field className={cn("w-full", className)}>
      {label && (
        <FieldLabel
          htmlFor={id}
          className="text-xs uppercase font-bold text-primary px-1"
        >
          {label}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal py-5 px-4 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "P", { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-50 overflow-hidden"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(newDate) => {
              if (newDate) {
                onChange(DateOnly.fromDate(newDate).toISO());
                setOpen(false);
              } else {
                onChange("");
              }
            }}
            initialFocus
            captionLayout="dropdown"
            // Set reasonable range for cattle management
            fromYear={2000}
            toYear={new Date().getFullYear() + 5}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
