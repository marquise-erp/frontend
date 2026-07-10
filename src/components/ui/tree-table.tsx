"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";


export interface TreeTableNode {
  id: string | number;
  children?: TreeTableNode[];
}

export interface TreeRowContext {
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  toggle: () => void;
}

export interface TreeTableProps<T extends TreeTableNode> {
  data: T[];
  renderRow: (node: T, ctx: TreeRowContext) => ReactNode;
  /** Defaults to 2. */
  defaultExpandedDepth?: number;
  /** Defaults to `node.children`. */
  getChildren?: (node: T) => T[] | undefined;
  className?: string;
}

function TreeTableRow<T extends TreeTableNode>({
  node,
  depth,
  renderRow,
  defaultExpandedDepth,
  getChildren,
}: {
  node: T;
  depth: number;
  renderRow: (node: T, ctx: TreeRowContext) => ReactNode;
  defaultExpandedDepth: number;
  getChildren: (node: T) => T[] | undefined;
}) {
  const children = getChildren(node);
  const hasChildren = (children?.length ?? 0) > 0;
  const [expanded, setExpanded] = useState(depth < defaultExpandedDepth);

  const ctx: TreeRowContext = {
    depth,
    expanded,
    hasChildren,
    toggle: () => setExpanded((prev) => !prev),
  };

  return (
    <div>
      {renderRow(node, ctx)}
      {expanded && hasChildren && (
        <div>
          {children!.map((child) => (
            <TreeTableRow
              key={child.id}
              node={child}
              depth={depth + 1}
              renderRow={renderRow}
              defaultExpandedDepth={defaultExpandedDepth}
              getChildren={getChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}


export function TreeTable<T extends TreeTableNode>({
  data,
  renderRow,
  defaultExpandedDepth = 2,
  getChildren = (node) => node.children as T[] | undefined,
  className,
}: TreeTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border/40", className)}>
      {data.map((node) => (
        <TreeTableRow
          key={node.id}
          node={node}
          depth={0}
          renderRow={renderRow}
          defaultExpandedDepth={defaultExpandedDepth}
          getChildren={getChildren}
        />
      ))}
    </div>
  );
}
