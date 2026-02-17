"use client";

import { useState, type ReactNode } from "react";
import { useLocale } from "./LocaleProvider";

interface TabDef {
  key: string;
  labelKey: string;
  content: ReactNode;
}

interface SentimentTabsProps {
  tabs: TabDef[];
}

export function SentimentTabs({ tabs }: SentimentTabsProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  return (
    <div>
      {/* Tab bar - horizontal scroll on mobile */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              shrink-0 px-4 py-2.5 text-sm font-medium transition-colors
              border-b-2 -mb-px whitespace-nowrap
              ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
              }
            `}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content - all mounted, only active visible */}
      <div className="pt-4">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={activeTab === tab.key ? "block" : "hidden"}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
