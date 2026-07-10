import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { OrgMember } from "../../types/organization-tree";

interface Props {
  users: OrgMember[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function AvatarGroup({ users, max = 5, size = "sm", className }: Props) {
  const visible = users.slice(0, max);
  const extra = users.length - visible.length;
  const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";

  if (users.length === 0) {
    return <span className="text-[10px] text-muted-foreground/60">بدون کاربر</span>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("flex -space-x-2 rtl:space-x-reverse rtl:-space-x-1", className)} dir="ltr">
        {visible.map((u) => (
          <Tooltip key={u.id}>
            <TooltipTrigger asChild>
              <Avatar className={cn(dim, "ring-2 ring-background hover:z-10 transition-transform hover:-translate-y-0.5")}>
                <AvatarImage src={u.avatar} alt={u.fullName} />
                <AvatarFallback className="bg-muted">
                  <img src={u.avatar} alt={u.fullName} loading="lazy" />
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="top" dir="rtl">
              <div className="text-xs font-medium">{u.fullName}</div>
              <div className="text-[10px] text-muted-foreground">{u.email}</div>
            </TooltipContent>
          </Tooltip>
        ))}
        {extra > 0 && (
          <Avatar className={cn(dim, "ring-2 ring-background bg-muted")}>
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
              +{extra.toLocaleString("fa-IR")}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </TooltipProvider>
  );
}
