"use client";

import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Building02Icon,
  Calendar01Icon,
  Coins01Icon,
  MapPinpoint01Icon,
  PercentCircleIcon,
  Shield01Icon,
  Tag01Icon,
  UserStar01Icon,
} from "@hugeicons/core-free-icons";
import type { CityProfile, RegionProfile } from "../../schemas/responses";
import { ORGANIZATION_LEVELS, type OrganizationTreeNode } from "../../types/organization-tree";

interface GeneralTabProps {
  node: OrganizationTreeNode;
  memberCount?: number;
}

type InfoRow = {
  icon: IconSvgElement;
  label: string;
  value: string;
};

function isRegionProfile(profile: RegionProfile | CityProfile): profile is RegionProfile {
  return "tax_rate" in profile;
}

function InfoTable({ title, rows }: { title: string; rows: InfoRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        {title}
      </div>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
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

export function GeneralTab({ node, memberCount = 0 }: GeneralTabProps) {
  const t = useTranslations("organization.sheet");
  const meta = ORGANIZATION_LEVELS[node.type];

  const infoRows: InfoRow[] = [
    { icon: Building02Icon, label: t("general.type"), value: meta.label },
    { icon: Shield01Icon, label: t("general.parent"), value: "—" },
    { icon: Calendar01Icon, label: t("general.created"), value: "—" },
    { icon: UserStar01Icon, label: t("general.createdBy"), value: "—" },
  ];

  const profileRows: InfoRow[] = [];
  let profileTitle: string | null = null;

  if (node.profile) {
    if (node.type === "region" && isRegionProfile(node.profile)) {
      profileTitle = t("general.regionSettings");
      profileRows.push(
        {
          icon: PercentCircleIcon,
          label: t("general.taxRate"),
          value: node.profile.tax_rate,
        },
        {
          icon: Tag01Icon,
          label: t("general.taxName"),
          value: node.profile.tax_name ?? "—",
        },
        {
          icon: Coins01Icon,
          label: t("general.currencyCode"),
          value: node.profile.currency_code,
        },
      );
    } else if (node.type === "city" && !isRegionProfile(node.profile)) {
      profileTitle = t("general.citySettings");
      profileRows.push({
        icon: MapPinpoint01Icon,
        label: t("general.cityName"),
        value: node.profile.name,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("general.subOrgs")}</p>
          <p className="pt-1 text-2xl font-semibold text-foreground">
            {node.children?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("general.totalMembers")}</p>
          <p className="pt-1 text-2xl font-semibold text-foreground">{memberCount}</p>
        </div>
      </div>

      <InfoTable title={t("general.info")} rows={infoRows} />

      {profileTitle && profileRows.length > 0 && (
        <InfoTable title={profileTitle} rows={profileRows} />
      )}
    </div>
  );
}
