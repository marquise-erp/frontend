import type { OrganizationTreeNode } from "../types/organization-tree";

function walkNodes(
  roots: OrganizationTreeNode[],
  visit: (node: OrganizationTreeNode) => void,
) {
  for (const root of roots) {
    visit(root);
    root.children?.forEach((child) => walkNodes([child], visit));
  }
}

export function findNode(
  roots: OrganizationTreeNode[],
  id: string,
): OrganizationTreeNode | null {
  let found: OrganizationTreeNode | null = null;
  walkNodes(roots, (node) => {
    if (node.id === id) found = node;
  });
  return found;
}

export function findPath(
  roots: OrganizationTreeNode[],
  id: string,
): OrganizationTreeNode[] {
  function search(
    nodes: OrganizationTreeNode[],
    trail: OrganizationTreeNode[],
  ): OrganizationTreeNode[] | null {
    for (const node of nodes) {
      const nextTrail = [...trail, node];
      if (node.id === id) return nextTrail;
      const childPath = node.children
        ? search(node.children, nextTrail)
        : null;
      if (childPath) return childPath;
    }
    return null;
  }

  return search(roots, []) ?? [];
}

export function collectRegions(roots: OrganizationTreeNode[]): OrganizationTreeNode[] {
  const regions: OrganizationTreeNode[] = [];
  walkNodes(roots, (node) => {
    if (node.type === "region") regions.push(node);
  });
  return regions;
}
