"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Building02Icon,
  Calendar01Icon,
  Clock01Icon,
  Coins01Icon,
  Globe02Icon,
  LanguageSkillIcon,
  Link01Icon,
  Mail01Icon,
  MapPinpoint01Icon,
  PaintBoardIcon,
  PercentCircleIcon,
  Shield01Icon,
  SmartPhone01Icon,
  Tag01Icon,
  TextIcon,
  UserStar01Icon,
} from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import type {
  OrganizationResponse,
  RegionProfile,
  BrandProfile,
  BranchProfile,
  CityProfile,
} from "../../schemas/responses";
import { locationItemListSchema } from "../../schemas/responses";
import { ORGANIZATION_LEVELS, type OrganizationTreeNode } from "../../types/organization-tree";
import { useCountries, useProvinces, useCities, useUpdateOrganization } from "../../api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneralTabProps {
  node: OrganizationTreeNode;
  detailData?: OrganizationResponse;
  isDetailLoading?: boolean;
  memberCount?: number;
}

type InfoRow = {
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

function ProfileSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-4 bg-card">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// ── Type guards for profile types ─────────────────────────────────────

function isRegionProfile(profile: unknown): profile is RegionProfile {
  return !!profile && typeof profile === "object" && "tax_rate" in profile && "currency_code" in profile;
}

function isBrandProfile(profile: unknown): profile is BrandProfile {
  return !!profile && typeof profile === "object" && "primary_color" in profile;
}

function isBranchProfile(profile: unknown): profile is BranchProfile {
  return !!profile && typeof profile === "object" && "postal_code" in profile;
}

// ── Region profile form ───────────────────────────────────────────────

function RegionProfileForm({
  profile,
  onSave,
  isLoading,
}: {
  profile: RegionProfile | null | undefined;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}) {
  const [taxRate, setTaxRate] = useState(String(profile?.tax_rate ?? ""));
  const [taxName, setTaxName] = useState(profile?.tax_name ?? "");
  const [currencyCode, setCurrencyCode] = useState(profile?.currency_code ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? "");
  const [locale, setLocale] = useState(profile?.locale ?? "");

  useEffect(() => {
    setTaxRate(String(profile?.tax_rate ?? ""));
    setTaxName(profile?.tax_name ?? "");
    setCurrencyCode(profile?.currency_code ?? "");
    setTimezone(profile?.timezone ?? "");
    setLocale(profile?.locale ?? "");
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave({
      tax_rate: taxRate,
      tax_name: taxName || null,
      currency_code: currencyCode,
      timezone: timezone,
      locale: locale,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4 bg-card">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-2">تنظیمات منطقه</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="region-tax-rate">نرخ مالیات</Label>
          <Input
            id="region-tax-rate"
            type="text"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="0.09"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="region-tax-name">نام مالیات</Label>
          <Input
            id="region-tax-name"
            type="text"
            value={taxName}
            onChange={(e) => setTaxName(e.target.value)}
            placeholder="VAT"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="region-currency">کد ارز</Label>
        <Input
          id="region-currency"
          type="text"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          placeholder="IRT"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="region-timezone">منطقه زمانی</Label>
          <Input
            id="region-timezone"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Tehran"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="region-locale">زبان (Locale)</Label>
          <Input
            id="region-locale"
            type="text"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="fa"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات منطقه"}
      </Button>
    </form>
  );
}

// ── Brand profile form ────────────────────────────────────────────────

function BrandProfileForm({
  profile,
  onSave,
  isLoading,
}: {
  profile: BrandProfile | null | undefined;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}) {
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [primaryColor, setPrimaryColor] = useState(profile?.primary_color ?? "");
  const [secondaryColor, setSecondaryColor] = useState(profile?.secondary_color ?? "");

  useEffect(() => {
    setWebsite(profile?.website ?? "");
    setPrimaryColor(profile?.primary_color ?? "");
    setSecondaryColor(profile?.secondary_color ?? "");
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave({
      website: website || null,
      primary_color: primaryColor || null,
      secondary_color: secondaryColor || null,
      settings: profile?.settings || null,
    });
  };

  const isValidHex = (val: string) => /^#[0-9A-F]{6}$/i.test(val);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4 bg-card">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-2">تنظیمات برند</h3>

      <div className="space-y-1.5">
        <Label htmlFor="brand-website">وب‌سایت</Label>
        <Input
          id="brand-website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="brand-primary-color">رنگ اصلی</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={isValidHex(primaryColor) ? primaryColor : "#000000"}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 p-0 cursor-pointer shrink-0 border"
            />
            <Input
              id="brand-primary-color"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand-secondary-color">رنگ فرعی</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={isValidHex(secondaryColor) ? secondaryColor : "#000000"}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-10 h-10 p-0 cursor-pointer shrink-0 border"
            />
            <Input
              id="brand-secondary-color"
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات برند"}
      </Button>
    </form>
  );
}

// ── Branch profile form ───────────────────────────────────────────────

function BranchProfileForm({
  profile,
  onSave,
  isLoading,
}: {
  profile: BranchProfile | null | undefined;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}) {
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [mobile, setMobile] = useState(profile?.mobile ?? "");
  const [postalCode, setPostalCode] = useState(profile?.postal_code ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [latitude, setLatitude] = useState(profile?.latitude != null ? String(profile.latitude) : "");
  const [longitude, setLongitude] = useState(profile?.longitude != null ? String(profile.longitude) : "");
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(profile?.business_license_number ?? "");
  const [businessLicenseExpireAt, setBusinessLicenseExpireAt] = useState(profile?.business_license_expire_at ?? "");
  const [taxIdentifier, setTaxIdentifier] = useState(profile?.tax_identifier ?? "");
  const [taxFileNumber, setTaxFileNumber] = useState(profile?.tax_file_number ?? "");

  useEffect(() => {
    setPhone(profile?.phone ?? "");
    setMobile(profile?.mobile ?? "");
    setPostalCode(profile?.postal_code ?? "");
    setAddress(profile?.address ?? "");
    setLatitude(profile?.latitude != null ? String(profile.latitude) : "");
    setLongitude(profile?.longitude != null ? String(profile.longitude) : "");
    setBusinessLicenseNumber(profile?.business_license_number ?? "");
    setBusinessLicenseExpireAt(profile?.business_license_expire_at ?? "");
    setTaxIdentifier(profile?.tax_identifier ?? "");
    setTaxFileNumber(profile?.tax_file_number ?? "");
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave({
      phone: phone || null,
      mobile: mobile || null,
      postal_code: postalCode || null,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      business_license_number: businessLicenseNumber || null,
      business_license_expire_at: businessLicenseExpireAt || null,
      tax_identifier: taxIdentifier || null,
      tax_file_number: taxFileNumber || null,
      settings: profile?.settings || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4 bg-card">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-2">تنظیمات شعبه</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="branch-phone">تلفن تماس</Label>
          <Input
            id="branch-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch-mobile">شماره همراه</Label>
          <Input
            id="branch-mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-postal-code">کد پستی</Label>
        <Input
          id="branch-postal-code"
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-address">آدرس</Label>
        <Textarea
          id="branch-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="branch-lat">عرض جغرافیایی (Latitude)</Label>
          <Input
            id="branch-lat"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="35.6892"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch-lng">طول جغرافیایی (Longitude)</Label>
          <Input
            id="branch-lng"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="51.3890"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="branch-license-num">شماره جواز کسب</Label>
          <Input
            id="branch-license-num"
            type="text"
            value={businessLicenseNumber}
            onChange={(e) => setBusinessLicenseNumber(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch-license-expire">تاریخ انقضای جواز</Label>
          <Input
            id="branch-license-expire"
            type="date"
            value={businessLicenseExpireAt}
            onChange={(e) => setBusinessLicenseExpireAt(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="branch-tax-id">شناسه مالیاتی</Label>
          <Input
            id="branch-tax-id"
            type="text"
            value={taxIdentifier}
            onChange={(e) => setTaxIdentifier(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="branch-tax-file">شماره پرونده مالیاتی</Label>
          <Input
            id="branch-tax-file"
            type="text"
            value={taxFileNumber}
            onChange={(e) => setTaxFileNumber(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات شعبه"}
      </Button>
    </form>
  );
}

function CityProfileSection({
  node,
  profile,
}: {
  node: OrganizationTreeNode;
  profile: CityProfile | null | undefined;
}) {
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const { data: countries = [], isLoading: isCountriesLoading } = useCountries();
  const { data: provinces = [], isLoading: isProvincesLoading } = useProvinces(selectedCountryId, !!selectedCountryId);
  const { data: cities = [], isLoading: isCitiesLoading } = useCities(selectedProvinceId, !!selectedProvinceId);

  const updateMutation = useUpdateOrganization();

  const cityIdFromProfile = profile?.city_id;
  const provinceIdFromProfile = profile?.province_id;
  const countryIdFromProfile = profile?.country_id;

  // Initialize selections from profile when available
  useEffect(() => {
    if (countryIdFromProfile) {
      setSelectedCountryId(String(countryIdFromProfile));
    }
    if (provinceIdFromProfile) {
      setSelectedProvinceId(String(provinceIdFromProfile));
    }
    if (cityIdFromProfile) {
      setSelectedCityId(String(cityIdFromProfile));
    }
  }, [cityIdFromProfile, provinceIdFromProfile, countryIdFromProfile]);

  // Fallback: Auto-set first country if none in profile and none selected
  useEffect(() => {
    if (countries.length > 0 && !selectedCountryId && !countryIdFromProfile) {
      setSelectedCountryId(String(countries[0].id));
    }
  }, [countries, selectedCountryId, countryIdFromProfile]);

  // Fallback: Auto-set first province if none in profile and none selected
  useEffect(() => {
    if (provinces.length > 0 && !selectedProvinceId && !provinceIdFromProfile) {
      setSelectedProvinceId(String(provinces[0].id));
    }
  }, [provinces, selectedProvinceId, provinceIdFromProfile]);

  // Fallback: Auto-set first city if none in profile and none selected
  useEffect(() => {
    if (cities.length > 0 && !selectedCityId && !cityIdFromProfile) {
      setSelectedCityId(String(cities[0].id));
    }
  }, [cities, selectedCityId, cityIdFromProfile]);

  const handleSaveCity = async (cityId: number, name: string) => {
    try {
      await updateMutation.mutateAsync({
        id: Number(node.id),
        data: {
          id: Number(node.id),
          name,
          description: node.description ?? undefined,
          profile: {
            city_id: cityId,
            province_id: Number(selectedProvinceId),
            country_id: Number(selectedCountryId),
          },
        },
      });
      toast.success("شهر با موفقیت به‌روزرسانی شد");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "خطا در به‌روزرسانی شهر";
      toast.error(errorMsg);
    }
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedProvinceId("");
    setSelectedCityId("");
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedCityId("");
  };

  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId);
    const city = cities.find((c) => String(c.id) === String(cityId));
    if (city) {
      await handleSaveCity(Number(city.id), city.name);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-1">تغییر نام و اطلاعات شهر</h3>
      <p className="text-xs text-muted-foreground mb-3">شهر فعلی: {node.name}</p>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>کشور</Label>
          <Select
            value={selectedCountryId}
            onValueChange={handleCountryChange}
            disabled={isCountriesLoading || countries.length === 0 || updateMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب کشور" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={String(country.id)}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>استان</Label>
          <Select
            value={selectedProvinceId}
            onValueChange={handleProvinceChange}
            disabled={isProvincesLoading || provinces.length === 0 || !selectedCountryId || updateMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب استان" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={String(province.id)}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>شهر</Label>
          <Select
            value={selectedCityId}
            onValueChange={handleCityChange}
            disabled={isCitiesLoading || cities.length === 0 || !selectedProvinceId || updateMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="انتخاب شهر" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ── Main GeneralTab ───────────────────────────────────────────────────

export function GeneralTab({ node, detailData, isDetailLoading, memberCount = 0 }: GeneralTabProps) {
  const t = useTranslations("organization.sheet");
  const meta = ORGANIZATION_LEVELS[node.type];

  // Use profile from detail data (server) if available
  const profile = detailData?.profile ?? node.profile;

  const updateMutation = useUpdateOrganization();

  const handleSaveProfile = async (profilePayload: Record<string, unknown>) => {
    try {
      await updateMutation.mutateAsync({
        id: Number(node.id),
        data: {
          id: Number(node.id),
          name: node.name,
          description: node.description ?? undefined,
          profile: profilePayload,
        },
      });
      toast.success("تنظیمات با موفقیت به‌روزرسانی شد");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "خطا در به‌روزرسانی تنظیمات";
      toast.error(errorMsg);
    }
  };

  const infoRows: InfoRow[] = [
    { icon: Building02Icon, label: t("general.type"), value: meta.label },
    { icon: Shield01Icon, label: t("general.parent"), value: "—" },
    { icon: Calendar01Icon, label: t("general.created"), value: "—" },
    { icon: UserStar01Icon, label: t("general.createdBy"), value: "—" },
  ];

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

      {/* Profile section per type */}
      {isDetailLoading ? (
        <ProfileSkeleton />
      ) : (
        <>
          {node.type === "region" && (
            <RegionProfileForm
              profile={profile as RegionProfile | null | undefined}
              onSave={handleSaveProfile}
              isLoading={updateMutation.isPending}
            />
          )}

          {node.type === "brand" && (
            <BrandProfileForm
              profile={profile as BrandProfile | null | undefined}
              onSave={handleSaveProfile}
              isLoading={updateMutation.isPending}
            />
          )}

          {node.type === "branch" && (
            <BranchProfileForm
              profile={profile as BranchProfile | null | undefined}
              onSave={handleSaveProfile}
              isLoading={updateMutation.isPending}
            />
          )}

          {node.type === "city" && (
            <CityProfileSection node={node} profile={profile as CityProfile | null | undefined} />
          )}
        </>
      )}
    </div>
  );
}
