import type { CustomerGroupListItemResponse } from "../schemas/responses";
import type { CustomerGroupTreeNode } from "../types/customer-group-tree";
import type { CustomerGroupType } from "../schemas/types";

/**
 * Converts the flat list returned by the API into the nested
 * {@link CustomerGroupTreeNode} shape consumed by the tree UI.
 */
export function buildCustomerGroupForest(
  nodes: CustomerGroupListItemResponse[],
): CustomerGroupTreeNode[] {
  const byId = new Map<number, CustomerGroupTreeNode>(
    nodes.map((n) => [
      n.id,
      {
        id: String(n.id),
        name: n.name,
        type: n.type ?? null,
        description: n.description ?? undefined,
        children: [],
      },
    ]),
  );

  const roots: CustomerGroupTreeNode[] = [];

  for (const n of nodes) {
    const node = byId.get(n.id)!;
    const parent = n.parent_id != null ? byId.get(n.parent_id) : undefined;

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children!.push(node);
  }

  for (const root of roots) {
    enrichSegmentType(root, root.type ?? undefined);
  }

  return roots;
}

function enrichSegmentType(node: CustomerGroupTreeNode, inherited?: CustomerGroupType) {
  const segmentType = node.type ?? inherited;
  if (segmentType) {
    node.segmentType = segmentType;
  }
  for (const child of node.children ?? []) {
    enrichSegmentType(child, segmentType);
  }
}
