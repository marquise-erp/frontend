"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORGANIZATION_LEVELS,
  type OrganizationLevel,
  type OrganizationLevelMeta,
} from "../config/organization-levels";
import type { OrganizationTreeNode } from "../schemas/organization-entities";
import { findPath, findNode } from "../lib/org-tree-utils";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "../hooks/use-organizations";
import { useRbac, rbacStore } from "../store/rbac-store";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Delete02Icon, PlusSignIcon, Settings01Icon, UserStarIcon } from "@hugeicons/core-free-icons";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  roots: OrganizationTreeNode[];
  parentId?: string;
  parentType?: OrganizationLevel;
  node?: OrganizationTreeNode;
}

export function NodeFormDialog({ open, onOpenChange, mode, roots, parentId, parentType, node }: Props) {
  const childType = mode === "edit" ? node!.type : parentType ? ORGANIZATION_LEVELS[parentType].child : null;
  const targetType = childType ?? "brand";
  const meta = ORGANIZATION_LEVELS[targetType];
  const Icon = meta.icon;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const createOrganization = useCreateOrganization();
  const updateOrganization = useUpdateOrganization();
  const isPending = createOrganization.isPending || updateOrganization.isPending;

  const parentNode = useMemo(() => {
    if (mode === "edit" && node) {
      const path = findPath(roots, node.id);
      return path.length > 1 ? path[path.length - 2] : null;
    }
    return parentId ? findNode(roots, parentId) : null;
  }, [roots, mode, node, parentId]);

  const parentPath = mode === "edit" && node
    ? findPath(roots, node.id).slice(0, -1)
    : parentId
      ? findPath(roots, parentId)
      : [];

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && node) {
      setName(node.name);
      setCode(node.code ?? "");
    } else {
      setName("");
      setCode("");
    }
  }, [open, mode, node]);

  const submit = async () => {
    if (!name.trim()) return;

    try {
      if (mode === "edit" && node) {
        await updateOrganization.mutateAsync({
          id: node.id,
          name: name.trim(),
          code: code.trim() || undefined,
        });
      } else if (parentId && parentType) {
        await createOrganization.mutateAsync({
          parentId,
          parentType,
          name: name.trim(),
          code: code.trim() || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // Errors surface via React Query; keep dialog open for retry.
    }
  };

  const showTabs = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1 flex-wrap">
            {parentPath.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1">
                {i > 0 && <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-3 w-3" />}
                <span>{ORGANIZATION_LEVELS[p.type].label}</span>
                <span className="text-foreground/70">«{p.name}»</span>
              </div>
            ))}
            {parentPath.length > 0 && <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-3 w-3" />}
            <span
              className="font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                color: meta.color,
              }}
            >
              {meta.label}
            </span>
          </div>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in oklab, ${meta.color} 15%, transparent)`, color: meta.color }}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="h-4 w-4" />
            </span>
            {mode === "edit" ? `ویرایش ${meta.label}` : `افزودن ${meta.label} جدید`}
          </DialogTitle>
        </DialogHeader>

        {showTabs ? (
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1 gap-2">
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="h-3.5 w-3.5" />
                عمومی
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex-1 gap-2">
                <HugeiconsIcon icon={UserStarIcon} strokeWidth={2} className="h-3.5 w-3.5" />
                پرسنل
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <GeneralForm
                name={name}
                setName={setName}
                code={code}
                setCode={setCode}
                meta={meta}
                parentRegionName={parentNode?.type === "region" ? parentNode.name : undefined}
              />
              <DialogFooter className="gap-2 sm:gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
                <Button
                  onClick={submit}
                  disabled={!name.trim() || isPending}
                  style={{ background: meta.color, color: "white" }}
                >
                  ذخیره تغییرات
                </Button>
              </DialogFooter>
            </TabsContent>
            <TabsContent value="personnel" className="mt-4">
              {node && <PersonnelTab levelId={node.id} levelType={node.type} />}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <GeneralForm
              name={name}
              setName={setName}
              code={code}
              setCode={setCode}
              meta={meta}
              parentRegionName={parentNode?.type === "region" ? parentNode.name : undefined}
            />
            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
              <Button
                onClick={submit}
                disabled={!name.trim() || isPending}
                style={{ background: meta.color, color: "white" }}
              >
                {`افزودن ${meta.label}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GeneralForm({
  name,
  setName,
  code,
  setCode,
  meta,
  parentRegionName,
}: {
  name: string;
  setName: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  meta: OrganizationLevelMeta;
  parentRegionName?: string;
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="flex items-center gap-2">
          نام {meta.label}
          {parentRegionName && (
            <Badge variant="secondary" className="text-[10px]">منطقه: {parentRegionName}</Badge>
          )}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`نام ${meta.label} را وارد کنید`}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="code">کد یکتا</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="مثلاً KIA-001"
          dir="ltr"
        />
      </div>
    </div>
  );
}

function PersonnelTab({ levelId, levelType }: { levelId: string; levelType: OrganizationLevel }) {
  const { users, roles } = useRbac();
  const levelUsers = users.filter((u) => u.levelId === levelId);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRoleId, setNewRoleId] = useState(roles[0]?.id ?? "");

  const submitNew = () => {
    if (!newName.trim() || !newEmail.trim() || !newRoleId) return;
    const seed = Math.floor(Math.random() * 70) + 1;
    rbacStore.addUser({
      fullName: newName.trim(),
      email: newEmail.trim(),
      avatar: `https://i.pravatar.cc/150?img=${seed}`,
      roleId: newRoleId,
      levelType,
      levelId,
      status: "active",
    });
    setNewName(""); setNewEmail(""); setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {levelUsers.length.toLocaleString("fa-IR")} کاربر اختصاص یافته
        </div>
        <Button size="sm" variant={adding ? "outline" : "default"} onClick={() => setAdding((v) => !v)}>
          {adding ? "بستن" : (<><HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-3.5 w-3.5 ml-1" />افزودن کاربر</>)}
        </Button>
      </div>

      {adding && (
        <div className="grid gap-2 rounded-lg border border-dashed p-3 bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input placeholder="نام و نام خانوادگی" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="ایمیل" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} dir="ltr" />
            <Select value={newRoleId} onValueChange={setNewRoleId}>
              <SelectTrigger><SelectValue placeholder="نقش" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                      {r.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>انصراف</Button>
            <Button size="sm" onClick={submitNew} disabled={!newName.trim() || !newEmail.trim()}>افزودن</Button>
          </div>
        </div>
      )}

      {levelUsers.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-lg">
          هیچ کاربری به این سطح اختصاص نیافته است.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">کاربر</TableHead>
                <TableHead className="text-start w-[180px]">نقش</TableHead>
                <TableHead className="text-start w-[90px]">وضعیت</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levelUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-start">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={u.avatar} alt={u.fullName} />
                        <AvatarFallback>
                          <img src={u.avatar} alt={u.fullName} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.fullName}</div>
                        <div className="text-[11px] text-muted-foreground truncate" dir="ltr">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-start">
                    <Select
                      value={u.roleId}
                      onValueChange={(v) => rbacStore.updateUser(u.id, { roleId: v })}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                              {r.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-start">
                    <Badge variant={u.status === "active" ? "secondary" : "outline"}>
                      {u.status === "active" ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive"
                      onClick={() => { if (confirm(`حذف ${u.fullName}؟`)) rbacStore.removeUser(u.id); }}
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
