import {
  BriefcaseIcon,
  Building02Icon,
  Globe02Icon,
  MapPinIcon,
  StoreIcon,
  UserStarIcon,
} from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

import type { OrganizationType } from "../schemas/organization-schema";

export type OrganizationLevel = OrganizationType;

export type OrganizationLevelMeta = {
  label: string;
  icon: IconSvgElement;
  color: string;
  child: OrganizationLevel | null;
};

export const ORGANIZATION_LEVELS = {
  holding: {
    label: "هلدینگ",
    icon: Building02Icon,
    color: "var(--level-holding)",
    child: "brand",
  },
  brand: {
    label: "برند",
    icon: BriefcaseIcon,
    color: "var(--level-brand)",
    child: "region",
  },
  region: {
    label: "منطقه",
    icon: Globe02Icon,
    color: "var(--level-region)",
    child: "city",
  },
  city: {
    label: "شهر",
    icon: MapPinIcon,
    color: "var(--level-city)",
    child: "branch",
  },
  branch: {
    label: "شعبه",
    icon: StoreIcon,
    color: "var(--level-branch)",
    child: "unit",
  },
  unit: {
    label: "واحد",
    icon: UserStarIcon,
    color: "var(--level-unit)",
    child: null,
  },
} as const satisfies Record<OrganizationLevel, OrganizationLevelMeta>;
