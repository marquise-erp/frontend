import type { OrganizationNode, OrganizationTreeNode } from "../schemas/organization-entities";

/**
 * Converts the flat list returned by the API into the nested
 * {@link OrganizationTreeNode} shape consumed by `OrgTree`.
 */
export function buildOrgForest(nodes: OrganizationNode[]): OrganizationTreeNode[] {
  const byId = new Map<number, OrganizationTreeNode>(
    nodes.map((n) => [
      n.id,
      {
        id: String(n.id),
        name: n.name,
        type: n.type,
        code: n.code ?? undefined,
        children: [],
      },
    ]),
  );

  const roots: OrganizationTreeNode[] = [];

  for (const n of nodes) {
    const node = byId.get(n.id)!;
    const parent = n.parent_id != null ? byId.get(n.parent_id) : undefined;

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children!.push(node);
  }

  return roots;
}
