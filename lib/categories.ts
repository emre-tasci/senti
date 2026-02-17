import type { CategoryDef } from "@/types";

export const CATEGORIES: CategoryDef[] = [
  {
    id: "layer-1",
    name_tr: "Layer 1",
    name_en: "Layer 1",
    description_tr: "Temel blokzincir protokolleri",
    description_en: "Base blockchain protocols",
    icon: "Layers",
    color: "text-blue-500",
  },
  {
    id: "decentralized-finance-defi",
    name_tr: "DeFi",
    name_en: "DeFi",
    description_tr: "Merkeziyetsiz finans protokolleri",
    description_en: "Decentralized finance protocols",
    icon: "Landmark",
    color: "text-purple-500",
  },
  {
    id: "stablecoins",
    name_tr: "Stablecoin",
    name_en: "Stablecoins",
    description_tr: "Degeri sabit tutulan kripto paralar",
    description_en: "Price-stable cryptocurrencies",
    icon: "DollarSign",
    color: "text-green-500",
  },
  {
    id: "meme-token",
    name_tr: "Meme Coin",
    name_en: "Meme Coins",
    description_tr: "Topluluk odakli meme kripto paralar",
    description_en: "Community-driven meme cryptocurrencies",
    icon: "Dog",
    color: "text-orange-500",
  },
  {
    id: "layer-2",
    name_tr: "Layer 2",
    name_en: "Layer 2",
    description_tr: "Olceklendirme cozumleri",
    description_en: "Scaling solutions",
    icon: "Network",
    color: "text-cyan-500",
  },
  {
    id: "artificial-intelligence",
    name_tr: "AI & Buyuk Veri",
    name_en: "AI & Big Data",
    description_tr: "Yapay zeka ve buyuk veri projeleri",
    description_en: "Artificial intelligence and big data projects",
    icon: "Brain",
    color: "text-pink-500",
  },
];

export const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

export function getCategoryDef(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
