"use client";

import { useState, useEffect } from "react";

type NotificationType = "success" | "error" | "info";

interface Notification {
  type: NotificationType;
  message: string;
}

// Simple event bus implementation for global notifications
type Listener = (notification: Notification | null) => void;
let listeners: Listener[] = [];
let currentNotification: Notification | null = null;

const notify = (notification: Notification | null) => {
  currentNotification = notification;
  listeners.forEach((l) => l(notification));
};

export const showNotification = (type: NotificationType, message: string) => {
  notify({ type, message });
};

export const dismissNotification = () => {
  notify(null);
};

export function useSyncNotifications() {
  const [notification, setNotification] = useState<Notification | null>(
    currentNotification
  );

  useEffect(() => {
    const listener: Listener = (n) => setNotification(n);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    notification,
    dismissNotification,
    showNotification,
  };
}
