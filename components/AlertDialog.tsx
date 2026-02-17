"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAlerts } from "@/hooks/useAlerts";
import { useLocale } from "./LocaleProvider";
import { formatPrice } from "@/lib/utils";

interface AlertDialogProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
}

export function AlertDialog({ coinId, coinName, currentPrice }: AlertDialogProps) {
  const { t } = useLocale();
  const { alerts, add, remove } = useAlerts();
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [open, setOpen] = useState(false);

  const coinAlerts = alerts.filter((a) => a.coinId === coinId && !a.triggered);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) return;
    add({ coinId, coinName, targetPrice: price, direction });
    setTargetPrice("");
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {t("alerts.title")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("alerts.add")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {open && (
          <div className="flex flex-wrap items-end gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground block mb-1">{t("alerts.targetPrice")}</label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={formatPrice(currentPrice)}
                className="w-full px-3 py-1.5 bg-background rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="min-w-[100px]">
              <label className="text-xs text-muted-foreground block mb-1">{t("alerts.direction")}</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as "above" | "below")}
                className="w-full px-3 py-1.5 bg-background rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="above">{t("alerts.above")}</option>
                <option value="below">{t("alerts.below")}</option>
              </select>
            </div>
            <Button size="sm" onClick={handleAdd}>
              {t("alerts.set")}
            </Button>
          </div>
        )}

        {coinAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("alerts.none")}</p>
        ) : (
          <div className="space-y-2">
            {coinAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
              >
                <span>
                  {alert.direction === "above" ? "↑" : "↓"}{" "}
                  {formatPrice(alert.targetPrice)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(alert.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
