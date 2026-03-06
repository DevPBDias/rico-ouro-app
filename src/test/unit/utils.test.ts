import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils: cn()", () => {
  it("should merge tailwind classes properly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should resolve tailwind conflicts", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isTrue = true;
    expect(cn("base-class", isTrue && "active-class")).toBe(
      "base-class active-class",
    );
  });
});
