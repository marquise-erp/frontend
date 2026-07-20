"use client"

import { useTranslations } from "next-intl"
import {
  FileText,
  Contact,
  Package,
  Receipt,
  ClipboardList,
  LayoutTemplate,
  Edit,
  Eye,
  History,
  MoreHorizontal,
  Trash2,
  Clock,
  GitBranch,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormStatus } from "../schemas/responses"

// ---------------------------------------------------------------------------
// Icon registry — maps server-provided icon names to Lucide components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Contact,
  Package,
  Receipt,
  ClipboardList,
  LayoutTemplate,
}

function FormIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICON_MAP[name]) ? ICON_MAP[name] : FileText
  return <Icon className={className} aria-hidden />
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_VARIANT: Record<FormStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
interface FormCardProps {
  form: Form
  onEdit: (form: Form) => void
  onPreview: (form: Form) => void
  onVersions: (form: Form) => void
  onDelete?: (form: Form) => void
}

export function FormCard({ form, onEdit, onPreview, onVersions, onDelete }: FormCardProps) {
  const t = useTranslations("forms_list")
  const status = form.status ?? "draft"
  const version = form.version ?? 1

  const updatedAt = form.updated_at
    ? formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })
    : null

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <FormIcon name={form.icon} className="size-5" />
        </div>

        {/* Title + description */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {form.title}
          </h3>
          {form.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {form.description}
            </p>
          ) : (
            <p className="mt-0.5 text-xs italic text-muted-foreground/60">
              {t("noDescription")}
            </p>
          )}
        </div>

        {/* Overflow menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={t("actions.more")}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(form)}>
              <Edit className="me-2 size-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreview(form)}>
              <Eye className="me-2 size-4" />
              {t("actions.preview")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVersions(form)}>
              <History className="me-2 size-4" />
              {t("actions.versions")}
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(form)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="me-2 size-4" />
                  {t("actions.delete")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
        <Badge variant={STATUS_VARIANT[status]} className="text-xs capitalize">
          {t(`status.${status}`)}
        </Badge>
        <Badge variant="outline" className="gap-1 text-xs">
          <GitBranch className="size-3" aria-hidden />
          v{version}
        </Badge>
      </div>

      {/* Footer meta */}
      {updatedAt && (
        <div className="mt-auto flex items-center gap-1.5 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          <span>{t("updatedAt", { time: updatedAt })}</span>
        </div>
      )}

      {/* Primary action buttons */}
      <div className="flex gap-2 border-t border-border p-3">
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onEdit(form)}
        >
          <Edit className="size-3.5" aria-hidden />
          {t("actions.edit")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => onPreview(form)}
          aria-label={t("actions.preview")}
        >
          <Eye className="size-3.5" aria-hidden />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => onVersions(form)}
          aria-label={t("actions.versions")}
        >
          <History className="size-3.5" aria-hidden />
        </Button>
      </div>
    </article>
  )
}
