import type { OrganizationLevel } from "./organization-levels";

// ===== Permissions grouped by module =====
export interface Permission {
  id: string;
  label: string;
}
export interface PermissionModule {
  id: string;
  label: string;
  permissions: Permission[];
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "dashboard",
    label: "داشبورد",
    permissions: [
      { id: "dashboard.view", label: "مشاهده داشبورد" },
      { id: "dashboard.export", label: "خروجی داشبورد" },
    ],
  },
  {
    id: "invoice",
    label: "اسناد فاکتور",
    permissions: [
      { id: "invoice.settings.view", label: "مشاهده تنظیمات اسناد فاکتور" },
      { id: "invoice.settings.create", label: "ایجاد تنظیمات سند فاکتور" },
      { id: "invoice.settings.edit", label: "ویرایش تنظیمات سند فاکتور" },
      { id: "invoice.settings.delete", label: "حذف تنظیمات سند فاکتور" },
      { id: "invoice.list", label: "مشاهده فاکتورها" },
      { id: "invoice.create", label: "ایجاد فاکتور" },
    ],
  },
  {
    id: "users",
    label: "کاربران",
    permissions: [
      { id: "users.view", label: "مشاهده کاربران" },
      { id: "users.create", label: "ایجاد کاربر" },
      { id: "users.edit", label: "ویرایش کاربر" },
      { id: "users.delete", label: "حذف کاربر" },
      { id: "users.assign_role", label: "انتساب نقش به کاربر" },
    ],
  },
  {
    id: "roles",
    label: "نقش‌ها و دسترسی‌ها",
    permissions: [
      { id: "roles.view", label: "مشاهده نقش‌ها" },
      { id: "roles.create", label: "ایجاد نقش" },
      { id: "roles.edit", label: "ویرایش نقش" },
      { id: "roles.delete", label: "حذف نقش" },
    ],
  },
  {
    id: "organization",
    label: "ساختار سازمانی",
    permissions: [
      { id: "org.view", label: "مشاهده ساختار سازمانی" },
      { id: "org.create", label: "ایجاد سطح جدید" },
      { id: "org.edit", label: "ویرایش سطح" },
      { id: "org.delete", label: "حذف سطح" },
    ],
  },
  {
    id: "reports",
    label: "گزارش‌ها",
    permissions: [
      { id: "reports.view", label: "مشاهده گزارش‌ها" },
      { id: "reports.financial", label: "مشاهده گزارش مالی" },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_MODULES.flatMap((m) => m.permissions);

// ===== Roles =====
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // permission ids
  color: string;
}

export const initialRoles: Role[] = [
  {
    id: "role-holding-admin",
    name: "مدیر هلدینگ",
    description: "دسترسی کامل به تمام بخش‌ها",
    color: "oklch(0.6 0.2 280)",
    permissions: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: "role-sales-manager",
    name: "مدیر فروش",
    description: "مدیریت فروش و فاکتورها",
    color: "oklch(0.65 0.18 30)",
    permissions: [
      "dashboard.view",
      "invoice.list",
      "invoice.create",
      "invoice.settings.view",
      "invoice.settings.edit",
      "reports.view",
      "users.view",
    ],
  },
  {
    id: "role-sales-operator",
    name: "اپراتور فروش",
    description: "ثبت فاکتور و مشاهده داشبورد",
    color: "oklch(0.7 0.15 50)",
    permissions: ["dashboard.view", "invoice.list", "invoice.create"],
  },
  {
    id: "role-finance",
    name: "کارشناس مالی",
    description: "مدیریت تنظیمات مالی و گزارش‌ها",
    color: "oklch(0.62 0.16 180)",
    permissions: [
      "dashboard.view",
      "invoice.settings.view",
      "invoice.settings.edit",
      "reports.view",
      "reports.financial",
    ],
  },
  {
    id: "role-support",
    name: "پشتیبانی",
    description: "مشاهده اطلاعات پایه",
    color: "oklch(0.68 0.16 145)",
    permissions: ["dashboard.view", "users.view"],
  },
];

// ===== Users =====
export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar: string; // pravatar url
  roleId: string;
  levelType: OrganizationLevel;
  levelId: string; // org node id
  status: "active" | "inactive";
  lastSeen?: string;
}

const px = (i: number) => `https://i.pravatar.cc/150?img=${i}`;

export const initialUsers: AppUser[] = [
  // Holding
  { id: "usr-1", fullName: "علی رضایی", email: "ali@kia.com", phone: "09121234567", avatar: px(11), roleId: "role-holding-admin", levelType: "holding", levelId: "h1", status: "active", lastSeen: "۲ دقیقه پیش" },
  { id: "usr-2", fullName: "نازنین احمدی", email: "nazanin@kia.com", avatar: px(47), roleId: "role-finance", levelType: "holding", levelId: "h1", status: "active", lastSeen: "امروز" },
  // Brand: Kia Gold
  { id: "usr-3", fullName: "مهدی کریمی", email: "mehdi@kia-gold.com", avatar: px(12), roleId: "role-sales-manager", levelType: "brand", levelId: "b1", status: "active", lastSeen: "۱ ساعت پیش" },
  { id: "usr-4", fullName: "زهرا حسینی", email: "zahra@kia-gold.com", avatar: px(45), roleId: "role-finance", levelType: "brand", levelId: "b1", status: "active" },
  { id: "usr-5", fullName: "حمید نوری", email: "hamid@kia-gold.com", avatar: px(13), roleId: "role-support", levelType: "brand", levelId: "b1", status: "active" },
  { id: "usr-6", fullName: "سحر مرادی", email: "sahar@kia-gold.com", avatar: px(48), roleId: "role-sales-operator", levelType: "brand", levelId: "b1", status: "active" },
  // Region Iran
  { id: "usr-7", fullName: "بهنام صادقی", email: "behnam@kia.com", avatar: px(14), roleId: "role-sales-manager", levelType: "region", levelId: "r1", status: "active" },
  { id: "usr-8", fullName: "مریم اسدی", email: "maryam@kia.com", avatar: px(49), roleId: "role-finance", levelType: "region", levelId: "r1", status: "active" },
  // City Tehran
  { id: "usr-9", fullName: "آرش طاهری", email: "arash@kia.com", avatar: px(15), roleId: "role-sales-manager", levelType: "city", levelId: "c1", status: "active" },
  { id: "usr-10", fullName: "نگار رحیمی", email: "negar@kia.com", avatar: px(44), roleId: "role-sales-operator", levelType: "city", levelId: "c1", status: "active" },
  // Branch Pasdaran
  { id: "usr-11", fullName: "سارا محمدی", email: "sara@kia.com", avatar: px(16), roleId: "role-sales-manager", levelType: "branch", levelId: "br1", status: "active", lastSeen: "همین الان" },
  { id: "usr-12", fullName: "رضا فتحی", email: "reza@kia.com", avatar: px(17), roleId: "role-sales-operator", levelType: "branch", levelId: "br1", status: "active" },
  { id: "usr-13", fullName: "لیلا اکبری", email: "leila@kia.com", avatar: px(43), roleId: "role-finance", levelType: "branch", levelId: "br1", status: "active" },
  { id: "usr-14", fullName: "میثم جلالی", email: "meysam@kia.com", avatar: px(18), roleId: "role-support", levelType: "branch", levelId: "br1", status: "inactive" },
  { id: "usr-15", fullName: "فاطمه قاسمی", email: "fateme@kia.com", avatar: px(42), roleId: "role-sales-operator", levelType: "branch", levelId: "br1", status: "active" },
  { id: "usr-16", fullName: "کیان عابدی", email: "kian@kia.com", avatar: px(19), roleId: "role-sales-operator", levelType: "branch", levelId: "br1", status: "active" },
  // Branch Aghdasie
  { id: "usr-17", fullName: "رضا کریمی", email: "rk@kia.com", avatar: px(20), roleId: "role-sales-manager", levelType: "branch", levelId: "br2", status: "active" },
  { id: "usr-18", fullName: "نوید پارسا", email: "navid@kia.com", avatar: px(21), roleId: "role-sales-operator", levelType: "branch", levelId: "br2", status: "active" },
  // Units
  { id: "usr-19", fullName: "سینا مظلومی", email: "sina@kia.com", avatar: px(22), roleId: "role-sales-operator", levelType: "unit", levelId: "u1", status: "active" },
  { id: "usr-20", fullName: "الهام بیاتی", email: "elham@kia.com", avatar: px(41), roleId: "role-finance", levelType: "unit", levelId: "u2", status: "active" },
];
