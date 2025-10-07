"use client";

import { Home, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  const getIconColor = (url: string) => {
    return pathname === url ? "text-blue-900" : "text-gray-400";
  };

  return (
    <nav className="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        <Link
          href="/home"
          className={`flex flex-col items-center p-2 ${getIconColor("/home")}`}
        >
          <Home className="w-6 h-6 mb-1" />
        </Link>
        <Link
          href="/bois"
          className={`flex flex-col items-center p-2 ${getIconColor("/bois")}`}
        >
          <FileText className="w-6 h-6 mb-1" />
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center p-2 ${getIconColor(
            "settings"
          )}`}
        >
          <Settings className="w-6 h-6 mb-1" />
        </Link>
      </div>
    </nav>
  );
}
