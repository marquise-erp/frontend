import {
  ChartHistogramIcon,
  Folder01Icon,
  Globe02Icon,
  NeuralNetworkIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { CustomerGroupType } from "../schemas/types";

export interface CustomerGroupTreeNode {
  id: string;
  name: string;
  /** Set only on root nodes (from API). */
  type?: CustomerGroupType | null;
  /** Inherited from the root ancestor for display styling. */
  segmentType?: CustomerGroupType;
  description?: string;
  children?: CustomerGroupTreeNode[];
}

export type CustomerGroupTypeMeta = {
  label: string;
  icon: IconSvgElement;
  color: string;
};

export const CUSTOMER_GROUP_TYPES = {
  demographic: {
    label: "جمعیت‌شناختی",
    icon: UserMultiple02Icon,
    color: "var(--level-demographic)",
  },
  financial: {
    label: "مالی",
    icon: NeuralNetworkIcon,
    color: "var(--level-financial)",
  },
  behavioral: {
    label: "رفتاری",
    icon: ChartHistogramIcon,
    color: "var(--level-behavioral)",
  },
  geographic: {
    label: "جغرافیایی",
    icon: Globe02Icon,
    color: "var(--level-geographic)",
  },
} as const satisfies Record<CustomerGroupType, CustomerGroupTypeMeta>;

export const CHILD_GROUP_META: CustomerGroupTypeMeta = {
  label: "زیرگروه",
  icon: Folder01Icon,
  color: "var(--muted-foreground)",
};

export function getNodeDisplayMeta(node: CustomerGroupTreeNode): CustomerGroupTypeMeta {
  const segmentType = node.type ?? node.segmentType;
  if (segmentType) {
    return CUSTOMER_GROUP_TYPES[segmentType];
  }
  return CHILD_GROUP_META;
}

export function isRootNode(node: CustomerGroupTreeNode): boolean {
  return node.type != null;
}

export const CUSTOMER_GROUP_TYPE_LIST = Object.keys(CUSTOMER_GROUP_TYPES) as CustomerGroupType[];
