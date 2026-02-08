"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface StandardTabListProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange?: (value: string) => void;
  className?: string;
  variant?: "premium" | "simple";
}

export function StandardTabList({
  tabs,
  activeTab,
  className,
  variant = "premium",
}: StandardTabListProps) {
  if (variant === "simple") {
    return (
      <TabsList
        className={cn(
          "h-12 rounded-md bg-muted/50 w-full overflow-x-hidden",
          className,
        )}
      >
        <div className="flex w-full h-full min-w-max p-1 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-white font-semibold flex items-center justify-center gap-2 px-1.5 transition-all duration-200"
            >
              {tab.icon && <tab.icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </div>
      </TabsList>
    );
  }

  return (
    <TabsList
      className={cn(
        "h-auto gap-2 rounded-xl p-1 bg-linear-to-r from-muted/50 to-muted/30 shadow-sm flex w-full overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {tabs.map(({ value, label, icon: Icon }) => {
        const isActive = activeTab === value;

        return (
          <TabsTrigger
            key={value}
            value={value}
            asChild
            className="p-0 border-none bg-transparent data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none shadow-none"
          >
            <motion.div
              layout
              className={cn(
                "flex h-9 items-center justify-center overflow-hidden rounded-md cursor-pointer transition-all duration-300",
                isActive
                  ? "flex-1 bg-primary text-white shadow-md border-none min-w-[90px]"
                  : "flex-none text-muted-foreground hover:bg-muted/50 min-w-[40px]",
              )}
              animate={{
                flex: isActive ? 1 : 0,
              }}
            >
              <motion.div className="flex h-9 w-full items-center justify-center px-2 gap-2">
                {Icon && <Icon className="aspect-square size-5 shrink-0" />}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      className="font-semibold text-[11px] uppercase whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
