"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface QueryErrorResetProps {
  error: Error;
  onRetry: () => void;
  message?: string;
}

export function QueryErrorReset({ error, onRetry, message }: QueryErrorResetProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{message || "Failed to load data"}</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}
