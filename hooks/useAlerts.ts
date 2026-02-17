"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getAlerts,
  addAlert as storageAddAlert,
  removeAlert as storageRemoveAlert,
  markAlertTriggered,
  type PriceAlert,
} from "@/lib/storage";
import type { Coin } from "@/types";

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggered, setTriggered] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  const add = useCallback(
    (alert: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => {
      storageAddAlert(alert);
      setAlerts(getAlerts());
    },
    []
  );

  const remove = useCallback((id: string) => {
    storageRemoveAlert(id);
    setAlerts(getAlerts());
    setTriggered((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const checkAlerts = useCallback(
    (coins: Coin[]) => {
      const currentAlerts = getAlerts();
      const newlyTriggered: PriceAlert[] = [];

      for (const alert of currentAlerts) {
        if (alert.triggered) continue;
        const coin = coins.find((c) => c.id === alert.coinId);
        if (!coin) continue;

        const shouldTrigger =
          (alert.direction === "above" && coin.current_price >= alert.targetPrice) ||
          (alert.direction === "below" && coin.current_price <= alert.targetPrice);

        if (shouldTrigger) {
          markAlertTriggered(alert.id);
          newlyTriggered.push({ ...alert, triggered: true });
        }
      }

      if (newlyTriggered.length > 0) {
        setAlerts(getAlerts());
        setTriggered((prev) => [...prev, ...newlyTriggered]);

        // Browser notification
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          for (const a of newlyTriggered) {
            new Notification(`CoinSentinel Alert`, {
              body: `${a.coinName} is now ${a.direction} $${a.targetPrice}`,
            });
          }
        }
      }
    },
    []
  );

  const dismissTriggered = useCallback((id: string) => {
    setTriggered((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { alerts, triggered, add, remove, checkAlerts, dismissTriggered };
}
