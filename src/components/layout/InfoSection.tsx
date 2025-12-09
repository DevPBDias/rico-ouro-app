import type React from "react";

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoSection({ title, children }: InfoSectionProps) {
  return (
    <div className="border-t border-border pt-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5 pl-4">
        {title}
      </h2>
      <div className="space-y-0 bg-card border border-border rounded-sm overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}
