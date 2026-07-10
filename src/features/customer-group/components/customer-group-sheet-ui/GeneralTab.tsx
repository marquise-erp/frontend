"use client";

import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { Calendar01Icon, Tag01Icon } from "@hugeicons/core-free-icons";
import {
  CUSTOMER_GROUP_TYPES,
  type CustomerGroupTreeNode,
} from "../../types/customer-group-tree";

interface GeneralTabProps {
  node: CustomerGroupTreeNode;
}

type InfoRow = {
  id: string;
  icon: IconSvgElement;
  label: string;
  value: string;
};

function InfoTable({ title, rows }: { title: string; rows: InfoRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        {title}
      </div>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={row.icon} strokeWidth={2} className="size-4" />
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function GeneralTab({ node }: GeneralTabProps) {
  const t = useTranslations("customerGroup.sheet");
  const segmentMeta = node.segmentType ? CUSTOMER_GROUP_TYPES[node.segmentType] : null;

  const infoRows: InfoRow[] = [
    ...(segmentMeta
      ? [
          {
            id: "segmentation",
            icon: Tag01Icon,
            label: t("general.segmentation"),
            value: segmentMeta.label,
          },
        ]
      : []),
    { id: "created", icon: Calendar01Icon, label: t("general.created"), value: "—" },
  ];

  return (
    <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("general.subGroups")}</p>
          <p className="pt-1 text-2xl font-semibold text-foreground">
            {node.children?.length ?? 0}
          </p>
        </div>
        {segmentMeta && (
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">{t("general.segmentation")}</p>
            <p className="pt-1 text-sm font-semibold text-foreground">{segmentMeta.label}</p>
          </div>
        )}
      </div>

      <InfoTable title={t("general.info")} rows={infoRows} />
    </div>
  );
}
