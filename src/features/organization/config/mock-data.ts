import { BriefcaseIcon, Building02Icon, Globe02Icon, MapPinIcon, StoreIcon, UserStarIcon } from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type NodeType = "holding" | "brand" | "region" | "city" | "branch" | "unit";
export type NodeStatus = "active" | "inactive" | "pending";

export const LEVEL_META: Record<
  NodeType,
  { label: string; childLabel: string; icon: IconSvgElement; color: string }
> = {
  holding: { label: "هلدینگ", childLabel: "برند", icon: Building02Icon, color: "var(--level-holding)" },
  brand: { label: "برند", childLabel: "منطقه", icon: BriefcaseIcon, color: "var(--level-brand)" },
  region: { label: "منطقه", childLabel: "شهر", icon: Globe02Icon, color: "var(--level-region)" },
  city: { label: "شهر", childLabel: "شعبه", icon: MapPinIcon, color: "var(--level-city)" },
  branch: { label: "شعبه", childLabel: "واحد", icon: StoreIcon, color: "var(--level-branch)" },
  unit: { label: "واحد", childLabel: "", icon: UserStarIcon, color: "var(--level-unit)" },
};

export const STATUS_META: Record<NodeStatus, { label: string; color: string }> = {
  active: { label: "فعال", color: "oklch(0.7 0.17 145)" },
  inactive: { label: "غیرفعال", color: "oklch(0.6 0.02 260)" },
  pending: { label: "در انتظار", color: "oklch(0.75 0.16 80)" },
};

// Mock cities catalog grouped by region name (simulating a server fetch)
export const REGION_CITY_CATALOG: Record<string, string[]> = {
  ایران: ["تهران", "اصفهان", "شیراز", "مشهد", "تبریز", "کرج", "اهواز", "قم"],
  اروپا: ["برلین", "پاریس", "لندن", "آمستردام", "مادرید", "رم"],
  دبی: ["دبی", "ابوظبی", "شارجه"],
  آمریکا: ["نیویورک", "لس‌آنجلس", "شیکاگو", "هیوستون"],
};

// Available regions list (would come from server in real app)
export const REGION_OPTIONS = ["ایران", "اروپا", "دبی", "آمریکا", "ترکیه", "آسیای شرقی"];

export async function fetchCitiesForRegion(regionName: string): Promise<string[]> {
  // simulate server latency
  await new Promise((r) => setTimeout(r, 250));
  return REGION_CITY_CATALOG[regionName] ?? [];
}

