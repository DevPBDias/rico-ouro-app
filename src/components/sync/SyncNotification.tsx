"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useSyncNotifications } from "@/hooks/useSyncNotifications";
import { Button } from "@/components/ui/button";

export function SyncNotification() {
  const { notification, dismissNotification } = useSyncNotifications();

  // Auto-dismiss após 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, dismissNotification]);

  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isError = notification.type === "error";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
          isSuccess
            ? "bg-green-50 border border-green-200"
            : isError
            ? "bg-red-50 border border-red-200"
            : ""
        }`}
      >
        <div className="flex-shrink-0">
          {isSuccess && (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          )}
          {isError && <XCircle className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              isSuccess ? "text-green-800" : isError ? "text-red-800" : ""
            }`}
          >
            {notification.message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissNotification}
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X
            className={`w-4 h-4 ${
              isSuccess ? "text-green-600" : isError ? "text-red-600" : ""
            }`}
          />
        </Button>
      </div>
    </div>
  );
}

