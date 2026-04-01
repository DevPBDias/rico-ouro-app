"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ComboboxContextValue = {
  multiple: boolean
  items: string[]
  selectedValues: string[]
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSelectValue: (value: string) => void
  onRemoveValue: (value: string) => void
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext() {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used inside a <Combobox> component.")
  }
  return context
}

export type ComboboxProps = {
  multiple?: boolean
  autoHighlight?: boolean
  items: string[]
  defaultValue?: string[] | string
  value?: string[] | string
  onValueChange?: (value: string[] | string) => void
  children: React.ReactNode
}

export function Combobox({
  multiple = false,
  items,
  defaultValue,
  value,
  onValueChange,
  children,
}: ComboboxProps) {
  const [internalSelectedValues, setInternalSelectedValues] = React.useState<string[]>(() => {
    if (defaultValue === undefined) {
      return []
    }

    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  })

  const [open, setOpen] = React.useState(false)

  const selectedValues = React.useMemo(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value]
    }

    return internalSelectedValues
  }, [internalSelectedValues, value])

  const updateValues = React.useCallback(
    (nextValues: string[]) => {
      if (value === undefined) {
        setInternalSelectedValues(nextValues)
      }

      if (onValueChange) {
        if (multiple) {
          onValueChange(nextValues)
        } else {
          onValueChange(nextValues[0] ?? "")
        }
      }
    },
    [multiple, onValueChange, value],
  )

  const onSelectValue = React.useCallback(
    (item: string) => {
      const alreadySelected = selectedValues.includes(item)
      const nextValues = multiple
        ? alreadySelected
          ? selectedValues
          : [...selectedValues, item]
        : [item]

      updateValues(nextValues)
    },
    [multiple, selectedValues, updateValues],
  )

  const onRemoveValue = React.useCallback(
    (item: string) => {
      const nextValues = selectedValues.filter((value) => value !== item)
      updateValues(nextValues)
    },
    [selectedValues, updateValues],
  )

  const contextValue = React.useMemo(
    () => ({
      multiple,
      items,
      selectedValues,
      open,
      setOpen,
      onSelectValue,
      onRemoveValue,
    }),
    [items, multiple, open, onRemoveValue, onSelectValue, selectedValues],
  )

  return (
    <ComboboxContext.Provider value={contextValue}>
      {children}
    </ComboboxContext.Provider>
  )
}

export const useComboboxAnchor = () => {
  return React.useRef<HTMLDivElement>(null)
}

export const ComboboxChips = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ComboboxChips(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 text-sm text-foreground",
        className,
      )}
      {...props}
    />
  )
})

export const ComboboxChip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  function ComboboxChip({ value, className, children, ...props }, ref) {
    const { onRemoveValue } = useComboboxContext()

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemoveValue(value)
          }}
          className="text-muted-foreground transition hover:text-foreground"
        >
          ×
        </button>
      </div>
    )
  },
)

export function ComboboxChipsInput(
  props: React.ComponentPropsWithoutRef<"input">,
) {
  const { setOpen } = useComboboxContext()
  const blurTimeout = React.useRef<number | null>(null)

  return (
    <input
      type="text"
      autoComplete="off"
      className={cn(
        "min-w-[120px] flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none",
        props.className,
      )}
      onFocus={(event) => {
        if (props.onFocus) {
          props.onFocus(event)
        }
        if (blurTimeout.current) {
          window.clearTimeout(blurTimeout.current)
          blurTimeout.current = null
        }
        setOpen(true)
      }}
      onBlur={(event) => {
        if (props.onBlur) {
          props.onBlur(event)
        }
        blurTimeout.current = window.setTimeout(() => {
          setOpen(false)
        }, 150)
      }}
      {...props}
    />
  )
}

export function ComboboxValue({
  children,
}: {
  children: (values: string[]) => React.ReactNode
}) {
  const { selectedValues } = useComboboxContext()
  return <>{children(selectedValues)}</>
}

export function ComboboxContent({
  anchor,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { anchor: React.RefObject<HTMLDivElement | null> }) {
  const { open } = useComboboxContext()
  if (!open) {
    return null
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ComboboxEmpty({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const { items, open } = useComboboxContext()
  if (!open || items.length > 0) {
    return null
  }

  return (
    <div className={cn("p-3 text-sm text-muted-foreground", className)}>
      {children}
    </div>
  )
}

export type ComboboxListProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (item: string) => React.ReactNode
}

export function ComboboxList({
  children,
  className,
  ...props
}: ComboboxListProps) {
  const { items } = useComboboxContext()

  return (
    <div className={cn("space-y-1 py-2", className)} {...props}>
      {items.map((item) => children(item))}
    </div>
  )
}

export function ComboboxItem({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  value: string
}) {
  const { onSelectValue, selectedValues, multiple, setOpen } = useComboboxContext()
  const selected = selectedValues.includes(value)

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-primary/5",
        selected ? "bg-primary/10" : "",
        className,
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        onSelectValue(value)
        if (!multiple) {
          setOpen(false)
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}
