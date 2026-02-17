"use client";

import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { PriceAlert } from "@/lib/storage";

interface AlertNotificationProps {
  triggered: PriceAlert[];
  onDismiss: (id: string) => void;
}

export function AlertNotification({ triggered, onDismiss }: AlertNotificationProps) {
  if (triggered.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {triggered.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span>
              <strong>{alert.coinName}</strong> reached{" "}
              {formatPrice(alert.targetPrice)} ({alert.direction})
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDismiss(alert.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
