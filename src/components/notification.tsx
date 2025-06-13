"use client";

import type React from "react";

import { X } from "lucide-react";
import { useState } from "react";

interface NotificationProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<
    (NotificationProps & { id: string })[]
  >([]);

  const showNotification = (props: NotificationProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...props, id }]);

    if (props.duration !== 0) {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      }, props.duration || 3000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return {
    notifications,
    showNotification,
    dismissNotification,
  };
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notifications, dismissNotification } = useNotification();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`w-80 rounded-lg border p-4 shadow-md ${
              notification.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                {notification.description && (
                  <p className="text-sm text-gray-500">
                    {notification.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Contexto global para notificações
import { createContext, useContext } from "react";

const NotificationContext = createContext<ReturnType<
  typeof useNotification
> | null>(null);

export function NotificationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const notificationUtils = useNotification();

  return (
    <NotificationContext.Provider value={notificationUtils}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notificationUtils.notifications.map((notification) => (
          <div
            key={notification.id}
            className={`w-80 rounded-lg border p-4 shadow-md ${
              notification.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                {notification.description && (
                  <p className="text-sm text-gray-500">
                    {notification.description}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  notificationUtils.dismissNotification(notification.id)
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationContextProvider"
    );
  }
  return context;
}
